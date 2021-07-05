import {
  DataTypes,
  Model,
  ModelScopeOptions,
  Sequelize,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyRemoveAssociationsMixin,
} from "sequelize";
import sequelize from "@database/connection";
import { UserModel } from "@models/User";
import { AdminModel } from "@models/Admin";

interface GroupChatInterface {
  id: number;
  groupSocketId: string;
  name: string;
  slug: string;
  description: string;
  sensitiveWords: string;
  totalMember?: number;
  totalMessage?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

class GroupChatModel
  extends Model<GroupChatInterface>
  implements GroupChatInterface
{
  public id!: number;
  public groupSocketId: string;
  public name: string;
  public slug: string;
  public description: string;
  public sensitiveWords: string;
  public totalMember?: number;
  public totalMessage?: number;
  public status: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;
  static readonly STATUS_ENUM = {
    DRAFT: "draft",
    PUBLIC: "public",
    PRIVATE: "private",
  };

  public addMembers: BelongsToManyAddAssociationsMixin<UserModel, number>;
  public getMembers: BelongsToManyGetAssociationsMixin<UserModel>;
  public countMembers: BelongsToManyCountAssociationsMixin;
  public removeMembers: BelongsToManyRemoveAssociationsMixin<UserModel, number>;

  public addAdmins: BelongsToManyAddAssociationsMixin<AdminModel, number>;
  public getAdmins: BelongsToManyGetAssociationsMixin<AdminModel>;
  public removeAdmins: BelongsToManyRemoveAssociationsMixin<AdminModel, number>;

  static readonly scopes: ModelScopeOptions = {
    withTotalMember: {
      attributes: {
        include: [
          [
            Sequelize.literal(
              "(SELECT COUNT(*) FROM group_chat_members WHERE group_chat_members.groupChatId = GroupChatModel.id)"
            ),
            "totalMember",
          ],
        ],
      },
    },
    withTotalMessage: {
      attributes: {
        include: [
          [
            Sequelize.literal(
              "(SELECT COUNT(*) FROM chat_logs WHERE chat_logs.groupChatId = GroupChatModel.id)"
            ),
            "totalMessage",
          ],
        ],
      },
    },
  };
}

const GroupChatDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupSocketId: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING(300),
  },
  slug: {
    type: DataTypes.STRING(600),
  },
  description: {
    type: DataTypes.TEXT,
  },
  sensitiveWords: {
    type: DataTypes.TEXT,
    set(value: string[]) {
      this.setDataValue("sensitiveWords", JSON.stringify(value));
    },
    get(): string[] {
      if (!this.getDataValue("sensitiveWords")) {
        return [];
      }
      return JSON.parse(this.getDataValue("sensitiveWords"));
    },
  },
  status: {
    type: DataTypes.ENUM({ values: Object.values(GroupChatModel.STATUS_ENUM) }),
    defaultValue: GroupChatModel.STATUS_ENUM.DRAFT,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
};

GroupChatModel.init(GroupChatDefine, {
  paranoid: true,
  scopes: GroupChatModel.scopes,
  tableName: "group_chats",
  deletedAt: "deletedAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { GroupChatInterface, GroupChatModel };
