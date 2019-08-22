import { Model } from 'sequelize';

class Subscription extends Model {
    static init(sequelize) {
        super.init(
            {
                // os campos aqui contidos não necessariamente existem no banco
                // tratam-se de campos que o usuario pode preencher no envio
                // Neste caso não precisamos que o usuário envie as informações
            },
            {
                sequelize,
            }
        );
    }

    static associate(models) {
        this.belongsTo(models.Meetup, {
            foreignKey: 'meetup_id',
            as: 'meetup',
        });
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
}

export default Subscription;
