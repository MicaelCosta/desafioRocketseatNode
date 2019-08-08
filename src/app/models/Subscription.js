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
        this.belongsTo(models.Meetup, { foreignKey: 'meetup_id' });
        this.belongsTo(models.User, { foreignKey: 'user_id' });
    }
}

export default Subscription;
