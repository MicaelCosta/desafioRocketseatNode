import { isBefore } from 'date-fns';
import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
    static init(sequelize) {
        super.init(
            {
                // os campos aqui contidos não necessariamente existem no banco
                // tratam-se de campos que o usuario pode preencher no envio
                title: Sequelize.STRING,
                description: Sequelize.STRING,
                location: Sequelize.STRING,
                date_meetup: Sequelize.DATE,
                past: {
                    type: Sequelize.VIRTUAL,
                    get() {
                        return isBefore(this.date, new Date());
                    },
                },
            },
            {
                sequelize,
            }
        );
    }

    // realiza as associações necessárias com outros models
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        this.belongsTo(models.File, { foreignKey: 'file_id', as: 'file' });

        /* // Um meetup pode estar associado a varias inscricoes
        this.hasMany(models.Subscription, {
            foreignKey: 'meetup_id',
            as: 'subscription',
        }); */
    }
}

export default Meetup;
