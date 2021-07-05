import { DataTypes, Model } from "sequelize";
import sequelize from "@database/connection";
import { GroupChatInterface } from "@models/GroupChat";
import { UserInterface } from "@models/User";

interface GroupChatMemberInterface {
  id: number;
  groupChatId: number;
  groupChat?: GroupChatInterface;
  userId: number;
  user?: UserInterface;
  createdAt: Date;
  updatedAt: Date;
}

class GroupChatMemberModel
  extends Model<GroupChatMemberInterface>
  implements GroupChatMemberInterface
{
  public id!: number;
  public groupChatId: number;
  public groupChat?: GroupChatInterface;
  public userId: number;
  public user?: UserInterface;
  public createdAt: Date;
  public updatedAt: Date;
}

const GroupChatMemberDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupChatId: {
    type: DataTypes.INTEGER,
  },
  userId: {
    type: DataTypes.INTEGER,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
};

GroupChatMemberModel.init(GroupChatMemberDefine, {
  tableName: "group_chat_members",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize,
});

export { GroupChatMemberInterface, GroupChatMemberModel };
