import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class SubscriptionMail {
    get key() {
        return 'SubscriptionMail';
    }

    async handle({ data }) {
        const { meetup, user } = data;

        await Mail.sendMail({
            to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
            subject: `[MeetApp] Nova Inscrição - ${meetup.title}`,
            template: 'subscription',
            context: {
                organizer: meetup.organizer.name,
                user: user.name,
                title: meetup.title,
                data: format(parseISO(meetup.date_meetup), 'dd/MM/yyyy'),
            },
        });
    }
}

export default new SubscriptionMail();
