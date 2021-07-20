import {
  DataTypes,
  Model,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationsMixin,
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

interface UserInterface {
  id: number;
  referrerId?: number;
  name: string;
  username: string;
  nickname: string;
  email: string;
  referralCode: string;
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
  roleId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class UserModel extends Model<UserInterface> implements UserInterface {
  public id: number;
  public referrerId?: number;
  public name: string;
  public username: string;
  public nickname: string;
  public email: string;
  public referralCode: string;
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
  public roleId: number;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly GENDER_ENUM = {
    MALE: "male",
    FEMALE: "female",
    OTHER: "other",
  };
  static readonly STATUS_ENUM = {
    BLOCKED: "blocked",
    WORKING: "working",
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

const UserDefine = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  referrerId: { type: DataTypes.INTEGER, allowNull: true },
  roleId: { type: DataTypes.INTEGER },
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
    defaultValue: UserModel.STATUS_ENUM.WORKING,
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

// Func
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

const generateAuthToken = async (user: UserInterface | UserModel) => {
  const token = jwt.sign({ id: user.id }, config.JWT_KEY, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
  return token;
};

const findPhone = async (phone: string) => {
  const user = await UserModel.findOne({
    where: { phone, status: UserModel.STATUS_ENUM.WORKING },
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
        name: user.name,
        username: user.username,
        nickname: user.nickname,
        roleId: user.roleId,
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
  generateAuthToken,
  findCredentials,
  findPhone
};
