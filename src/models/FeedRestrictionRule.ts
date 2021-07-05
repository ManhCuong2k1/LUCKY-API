import { DataTypes, Model, ValidationError } from "sequelize";
import sequelize from "@database/connection";
import { URL_REGEX_PATTERN } from "@util/constants";

interface FeedRestrictionRuleInterface {
  id: number;
  forbiddenWords: string[];
  minimumWordCount: number | 0;
  forbiddenUrls: string[];
}

class FeedRestrictionRuleModel extends Model<FeedRestrictionRuleInterface>
  implements FeedRestrictionRuleInterface {
    public id!: number;
    public forbiddenWords: string[];
    public minimumWordCount: number | 0;
    public forbiddenUrls: string[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static readonly UPDATABLE_PARAMETERS = [{ "forbiddenWords": new Array(0) }, "minimumWordCount", { "forbiddenUrls": new Array(0) }];

    static async getRules() {
      let rules = await FeedRestrictionRuleModel.findOne();
      if (!rules) rules = await FeedRestrictionRuleModel.create();
      return rules;
    }
  }

const FeedRestrictionRuleDefine = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  forbiddenWords: {
    type: DataTypes.TEXT,
    set(value: string[]) {
      this.setDataValue("forbiddenWords", JSON.stringify(value));
    },
    get(): string[] {
      if (!this.getDataValue("forbiddenWords")) return [];
      return JSON.parse(this.getDataValue("forbiddenWords"));
    }
  },
  minimumWordCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  forbiddenUrls: {
    type: DataTypes.TEXT,
    set(value: string[]) {
      this.setDataValue("forbiddenUrls", JSON.stringify(value));
    },
    get(): string[] {
      if (!this.getDataValue("forbiddenUrls")) return [];
      return JSON.parse(this.getDataValue("forbiddenUrls"));
    }
  }
};

FeedRestrictionRuleModel.init(FeedRestrictionRuleDefine, {
  validate: {
    validUrl() {
      const invalidUrls = this.forbiddenUrls.filter((url: string) => {
        return !url.match(URL_REGEX_PATTERN);
      });
      if (invalidUrls.length > 0) {
        throw new ValidationError(`URL không hợp lệ: ${invalidUrls.join(", ")}`);
      }
    }
  },
  tableName: "feed_restriction_rules",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  sequelize
});

export default FeedRestrictionRuleModel;
