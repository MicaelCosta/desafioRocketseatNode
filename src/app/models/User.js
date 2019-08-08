import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
    static init(sequelize) {
        super.init(
            {
                // os campos aqui contidos não necessariamente existem no banco
                // tratam-se de campos que o usuario pode preencher no envio
                name: Sequelize.STRING,
                email: Sequelize.STRING,
                password: Sequelize.VIRTUAL,
                password_hash: Sequelize.STRING,
            },
            {
                sequelize,
            }
        );

        // hook seria equivalente a uma trigger, antes de uma ação será executado a função
        this.addHook('beforeSave', async user => {
            if (user.password) {
                user.password_hash = await bcrypt.hash(user.password, 8);
            }
        });

        return this;
    }

    static associate(models) {
        // Um usuário pode organizar vários meetups
        this.hasMany(models.Meetup);

        // Um usuário pode se inscrever para vários meetups
        this.hasMany(models.Subscription);
    }

    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash);
    }
}

export default User;
