import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupOrganizationController {
    // Lista os meetups que o usuário é o organizador
    async index(req, res) {
        const meetups = await Meetup.findAll({
            where: { user_id: req.userId },
            include: [
                {
                    model: File,
                    as: 'file',
                    attributes: ['id', 'path', 'url'],
                },
            ],
            order: ['date_meetup'],
        });

        return res.json(meetups);
    }
}

export default new MeetupOrganizationController();
