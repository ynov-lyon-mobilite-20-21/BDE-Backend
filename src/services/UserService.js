const Crypto = require('crypto');
const MongooseService = require('./MongooseService');
const MailService = require('./MailService');
const Encrypt = require('crypto-js');

class UserService extends MongooseService {

    constructor () {
        super('User')
    }

    async createUser(params) {
        const userInDb = await this.getOneBy({ mail: params.mail });

        try {
            if (userInDb && !userInDb.active) {
                const activationLink = `${process.env.CLIENT_HOSTNAME}/user/activation?u=${userInDb._id}&k=${userInDb.activationKey}`;
                const mailIsSent = await MailService.registrationMail(userInDb.mail, activationLink)

                const {_id, mail} = userInDb;

                return {success: true, data: { user: { _id, mail }, userExist: true, mailIsSent }};
            } else if (userInDb && userInDb.active) {
                return { success: false, code: 'MAIL_ALREADY_USING' };
            } else {
                params.activationKey = Crypto.randomBytes(50).toString('hex')
                params.active = false;

                const newUser = await this.create(params);
                const activationLink = `${process.env.CLIENT_HOSTNAME}/user/activation?u=${newUser._id}&k=${newUser.activationKey}`
                const mailIsSent = await MailService.registrationMail(newUser.mail, activationLink)

                const {_id, mail} = newUser;

                return {success: true, data: { user: { _id, mail } ,userExist: false, mailIsSent }};
            }
        } catch (e) {
            console.log(e)
            return false
        }

    }

    async activeUser ({ userId, activationKey, password }) {
        const user = await this.getOneBy({ _id: userId });

        try {
            if (!user) {
                return { success: false, code: 'USER_DONT_EXISTS' };
            }

            if (user.active) {
                return { success: false, code: 'USER_ALREADY_ACTIVE' };
            }

            if (user.activationKey !== activationKey) {
                return { success: false, code: 'INVALID_ACTIVATION_KEY' }
            }

            await this.update({ _id: user.id }, {
                password: this.encryptPassword(password, user.mail),
                active: true,
                activationKey: null,
                registrationDate: Date.now()
            })

            return { success: true };
        } catch (e) {
            return { success: false, code: 'UNKNOWN_ERROR' };
        }
    }

    encryptPassword (password, mail) {
        return Encrypt.SHA256(`${password}===${mail}`).toString()
    }
}

module.exports = new UserService();
