import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
    isBefore,
    startOfDay,
    endOfDay,
    parseISO,
    startOfHour,
} from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
    async index(req, res) {
        const where = {};
        const page = req.query.page || 1;

        if (req.query.date) {
            const parsedDate = parseISO(req.query.date);

            where.date_meetup = {
                [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
            };
        }

        const meetups = await Meetup.findAll({
            where,
            include: [
                {
                    model: File,
                    as: 'file',
                    attributes: ['id', 'path', 'url'],
                },
                {
                    model: User,
                    as: 'user',
                },
            ],
            limit: 10,
            offset: 10 * page - 10,
        });

        return res.json(meetups);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string().required(),
            description: Yup.string().required(),
            location: Yup.string().required(),
            date_meetup: Yup.date().required(),
            file_id: Yup.number().required(),
        });

        // Realiza a validação do schema
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validação falhou' });
        }

        const { title, description, location, date_meetup, file_id } = req.body;

        const hourStart = startOfHour(parseISO(date_meetup));

        // Verifica se a data do meetup já passou
        if (isBefore(hourStart, new Date())) {
            return res.status(400).json({ error: 'Data do Meetup inválida' });
        }

        const meetup = await Meetup.create({
            title,
            description,
            location,
            date_meetup: hourStart,
            file_id,
            user_id: req.userId,
        });

        const retornoMeetup = await Meetup.findOne({
            where: {
                id: meetup.id,
            },
            include: [
                {
                    model: File,
                    as: 'file',
                    attributes: ['id', 'path', 'url'],
                },
            ],
        });

        return res.json(retornoMeetup);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string(),
            file_id: Yup.number(),
            description: Yup.string(),
            location: Yup.string(),
            date_meetup: Yup.date(),
        });

        // Valida o schema
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validação falhou' });
        }

        const user_id = req.userId;
        const { title, description, location, date_meetup, file_id } = req.body;

        const meetup = await Meetup.findByPk(req.params.id);

        // Verifica se o usuário é o organizador
        if (meetup.user_id !== user_id) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        const hourStart = startOfHour(parseISO(date_meetup));

        // Valida se a data já passou
        if (isBefore(hourStart, new Date())) {
            return res.status(400).json({ error: 'Data do Meetup inválida' });
        }

        if (meetup.past) {
            return res
                .status(400)
                .json({ error: 'Não pode atualizar meetups passados.' });
        }

        await meetup.update({
            title,
            description,
            location,
            date_meetup: hourStart,
            file_id,
            user_id: req.userId,
        });

        return res.json(meetup);
    }

    async delete(req, res) {
        const user_id = req.userId;

        const meetup = await Meetup.findByPk(req.params.id);

        if (meetup.user_id !== user_id) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        if (meetup.past) {
            return res
                .status(400)
                .json({ error: 'Não pode deletar meetups passados' });
        }

        await meetup.destroy();

        return res.send();
    }
}

export default new MeetupController();
