import {
  DataTypes,
  Model,
  ModelScopeOptions,
  Op,
  Sequelize,
} from "sequelize";
import sequelize from "@database/connection";
import { ERROR_CODES } from "@util/constants";
import { encryptPassword } from "@util/md5password";
import config from "../config";
import jwt from "jsonwebtoken";
import { ModelHooks } from "sequelize/types/lib/hooks";
import sendSmsOtp from "@util/sms";

interface UserInterface {
  id: number;
  referrerId?: number;
  name: string;
  username: string;
  nickname: string;
  email: string;
  referralCode: string;
  otpCode: string;
  avatar: string;
  password: string;
  gender: string;
  dateOfBirth: Date;
  phone: string;
  identify: string;
  status: string;
  isEnableReceiveEmail: boolean;
  totalFeed?: number;
  totalCoin: number;
  totalReward: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class UserModel extends Model<UserInterface> implements UserInterface {
  static generateOtpCode() {
    throw new Error("Method not implemented.");
  }
  public id: number;
  public referrerId?: number;
  public name: string;
  public username: string;
  public nickname: string;
  public email: string;
  public referralCode: string;
  public otpCode: string;
  public avatar: string;
  public password: string;
  public gender: string;
  public dateOfBirth: Date;
  public phone: string;
  public identify: string;
  public status: string;
  public isEnableReceiveEmail: boolean;
  public totalFeed?: number;
  public totalCoin: number;
  public totalReward: number;
  public role: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;

  static ROLE_ENUM = {
    ADMIN: "admin",
    EMPLOYE: "employe",
    USER: "user"
  };
  static readonly GENDER_ENUM = {
    MALE: "male",
    FEMALE: "female",
    OTHER: "other",
  };
  static readonly STATUS_ENUM = {
    BLOCKED: "blocked",
    WORKING: "working",
    PENDING: "pending",
  };
  static readonly CREATEABLE_PARAMETERS = ["name", "username", "nickname", "email", "referrerCode",
    "avatar", "password", "gender", "dateOfBirth", "phone", "identify"]

  static readonly hooks: Partial<ModelHooks<UserModel>> = {
    async beforeValidate(record) {
      record.referralCode = await UserModel.generateReferralCode();
    },
  }

  static readonly scopes: ModelScopeOptions = {
    byReferralCode(referralCode) {
      return { where: { referralCode } };
    },
    byReferrer(referrerId) {
      return { where: { referrerId } };
    },
    bySearch(searchKey) {
      if (searchKey) {
        return {
          where: {
            name: {
              [Op.substring]: searchKey,
            },
          },
        };
      }
      return {
        where: {},
      };
    },
    byDateRange(from, to) {
      if (from && to) {
        return {
          where: {
            createdAt: { [Op.between]: [from, to] },
          },
        };
      }

      return {
        where: {},
      };
    },
    withTotalFeed: {
      attributes: {
        include: [
          [
            Sequelize.literal(
              "(SELECT COUNT(*) FROM feeds WHERE feeds.authorId = UserModel.id and feeds.deletedAt IS NULL)"
            ),
            "totalFeed",
          ],
        ],
      },
    },
  };

  static async generateReferralCode() {
    let code = "";
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 6; i > 0; --i) code += characters[Math.floor(Math.random() * characters.length)];
    const existedUser = await UserModel.scope([{ method: ["byReferralCode", code] }]).findOne();
    if (existedUser) code = await this.generateReferralCode();
    return code;
  }
}

const generateUsername = async (length: number) => {
  let username = "";
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  while (true) {
    for (let i = length; i > 0; --i) {
      username += characters[Math.floor(Math.random() * characters.length)];
    }
    const checkExitsUser = await UserModel.findOne({
      where: {
        username
      }
    });

    if (checkExitsUser == null) break;
  }
  return username;
};

const generateString = (length: number) => {
  let string = "";
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; --i) {
    string += characters[Math.floor(Math.random() * characters.length)];
  }
return string;
};

const generateOtpCode = () => {
  let code = "";
  const characters = "0123456789";
  for (let i = 6; i > 0; --i) code += characters[Math.floor(Math.random() * characters.length)];
  return code;
};

const PostUserOtp = async (userId: number) => {
  try {
    const existedUser = await UserModel.findOne({ where: { id: userId } });
    if (existedUser !== null) {
      let code = "";
      const characters = "0123456789";
      for (let i = 6; i > 0; --i) code += characters[Math.floor(Math.random() * characters.length)];
      existedUser.otpCode = code;
      await existedUser.save();
      await existedUser.reload();
      const message = `${code} là mã xác minh của bạn`;
      await sendSmsOtp(existedUser.phone, message);
      return code;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

const UserDefine = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  referrerId: { type: DataTypes.INTEGER, allowNull: true },
  role: { type: DataTypes.STRING, defaultValue: UserModel.ROLE_ENUM.USER },
  name: { type: DataTypes.STRING },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Tên người dùng không được bỏ trống." },
      notEmpty: { msg: "Tên người dùng không được bỏ trống." }
    }
  },
  nickname: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  referralCode: { type: DataTypes.STRING, allowNull: true },
  otpCode: { type: DataTypes.STRING(300), defaultValue: generateOtpCode() },
  avatar: { type: DataTypes.STRING },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Mật khẩu không được bỏ trống." },
      notEmpty: { msg: "Mật khẩu không được bỏ trống." }
    }
  },
  gender: {
    type: DataTypes.ENUM({ values: Object.values(UserModel.GENDER_ENUM) }),
  },
  dateOfBirth: { type: DataTypes.DATEONLY },
  phone: { type: DataTypes.STRING },
  identify: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM({ values: Object.values(UserModel.STATUS_ENUM) }),
    defaultValue: UserModel.STATUS_ENUM.PENDING,
  },
  isEnableReceiveEmail: { type: DataTypes.BOOLEAN, defaultValue: true },
  totalCoin: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalReward: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
  deletedAt: { type: DataTypes.DATE },
};

UserModel.init(UserDefine, {
  paranoid: true,
  scopes: UserModel.scopes,
  hooks: UserModel.hooks,
  indexes: [{ unique: true, fields: ["username"] }, { unique: true, fields: ["phone"] }],
  tableName: "users",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  deletedAt: "deletedAt",
  sequelize,
});

const findCredentials = async (username: string, password: string) => {
  const user = await UserModel.findOne({
    where: { phone: username, status: UserModel.STATUS_ENUM.WORKING },
  });
  if (user == null) {
    throw new Error(ERROR_CODES.InvalidLoginCredentials);
  }
  const passwordHash = encryptPassword(password);
  const passwordMatch = passwordHash == user.password;

  if (!passwordMatch) throw new Error(ERROR_CODES.InvalidLoginCredentials);
  return user;
};

const findCredentialAdmin = async (username: string, password: string) => {
  const user = await UserModel.findOne({
    where: { username: username, status: UserModel.STATUS_ENUM.WORKING },
  });
  console.log(username);

  if (user == null) {
    throw new Error(ERROR_CODES.InvalidLoginCredentials);
  }
  const passwordHash = encryptPassword(password);
  const passwordMatch = passwordHash == user.password;

  if (!passwordMatch) throw new Error(ERROR_CODES.InvalidLoginCredentials);
  return user;
};


const generateAuthToken = async (user: UserInterface | UserModel) => {
  const token = jwt.sign({ id: user.id }, config.JWT_KEY, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
  return token;
};

const findPhone = async (phone: string) => {
  const user = await UserModel.findOne({
    where: { phone },
  });
  if (user == null) {
    return {
      status: false,
      message: "can't find phone",
    };
  } else {
    return {
      status: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        totalCoin: user.totalCoin,
        totalReward: user.totalReward,
        createdAt: user.createdAt
      },
      messgae: "success"
    };
  }
};

export {
  UserModel,
  UserInterface,
  generateString,
  generateUsername,
  generateAuthToken,
  generateOtpCode,
  PostUserOtp,
  findCredentials,
  findCredentialAdmin,
  findPhone
};