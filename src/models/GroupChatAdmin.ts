import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";
import { GroupChatInterface } from "@models/GroupChat";
import { AdminInterface } from "@models/Admin";

interface GroupChatAdminInterface {
  id: number;
  groupChatId: number;
  groupChat?: GroupChatInterface;
  adminId: number;
  admin?: AdminInterface;
  createdAt: Date;
  updatedAt: Date;
}

class GroupChatAdminModel
  extends Model<GroupChatAdminInterface>
  implements GroupChatAdminInterface
{
  public id!: number;
  public groupChatId: number;
  public groupChat?: GroupChatInterface;
  public adminId: number;
  public admin?: AdminInterface;
  public createdAt: Date;
  public updatedAt: Date;
}

const GroupChatAdminDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupChatId: {
    type: DataTypes.INTEGER,
  },
  adminId: {
    type: DataTypes.INTEGER,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
};

GroupChatAdminModel.init(GroupChatAdminDefine, {
  tableName: "group_chat_admins",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { GroupChatAdminInterface, GroupChatAdminModel };
