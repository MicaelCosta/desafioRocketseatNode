import Meetup from '../models/Meetup';

class MeetupOrganizationController {
    // Lista os meetups que o usuário é o organizador
    async index(req, res) {
        const meetups = await Meetup.findAll({
            where: { user_id: req.userId },
        });

        return res.json(meetups);
    }
}

export default new MeetupOrganizationController();
