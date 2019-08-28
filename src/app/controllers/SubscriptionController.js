import { Op } from 'sequelize';
import { startOfDay, endOfDay } from 'date-fns';
import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import File from '../models/File';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscriptionController {
    async index(req, res) {
        const subscriptions = await Subscription.findAll({
            where: {
                user_id: req.userId,
            },
            include: [
                {
                    model: Meetup,
                    as: 'meetup',
                    where: {
                        date_meetup: {
                            [Op.between]: [
                                startOfDay(new Date()),
                                endOfDay(new Date()),
                            ],
                        },
                    },
                    required: true,
                    include: [
                        {
                            model: User,
                            as: 'user',
                        },
                        {
                            model: File,
                            as: 'file',
                        },
                    ],
                    order: [[Meetup, 'date_meetup']],
                },
            ],
        });

        return res.json(subscriptions);
    }

    async store(req, res) {
        const user = await User.findByPk(req.userId);
        const meetup = await Meetup.findByPk(req.params.meetupId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email'],
                },
            ],
        });

        if (meetup.user_id === req.userId) {
            return res.status(400).json({
                error:
                    'Não pode se inscrever em meetups, sendo voce o organizador',
            });
        }

        if (meetup.past) {
            return res
                .status(400)
                .json({ error: 'Não pode se inscrever em meetups passados' });
        }

        const checkDate = await Subscription.findOne({
            where: {
                user_id: user.id,
            },
            // inclui o model de meetup para realizar um segundo where pela data
            include: [
                {
                    model: Meetup,
                    as: 'meetup',
                    required: true,
                    where: {
                        date_meetup: meetup.date_meetup,
                    },
                },
            ],
        });

        if (checkDate) {
            return res.status(400).json({
                error: 'Você já está inscrito neste meetup',
            });
        }

        const subscription = await Subscription.create({
            user_id: user.id,
            meetup_id: meetup.id,
        });

        // Envia e-mail ao organizador
        await Queue.add(SubscriptionMail.key, {
            meetup,
            user,
        });

        return res.json(subscription);
    }

    async delete(req, res) {
        const subscription = await Subscription.findByPk(req.params.id);

        if (!subscription) {
            return res.status(400).json({ error: 'Incrição não encontrada' });
        }

        await subscription.destroy();

        return res.json();
    }
}

export default new SubscriptionController();
