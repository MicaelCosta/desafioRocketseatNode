import Sequelize, { Model } from 'sequelize';

class File extends Model {
    static init(sequelize) {
        super.init(
            {
                // os campos aqui contidos não necessariamente existem no banco
                // tratam-se de campos que o usuario pode preencher no envio
                name: Sequelize.STRING,
                path: Sequelize.STRING,
                url: {
                    type: Sequelize.VIRTUAL,
                    get() {
                        return `${process.env.APP_URL}/files/${this.path}`;
                    },
                },
            },
            {
                sequelize,
            }
        );

        return this;
    }
}

export default File;
