import _ from "lodash";
import Parameters from "../util/parameters";

const strongParams = () => {
  return (req: any, res: any, next: any) => {
    let _params: Parameters<typeof req.params>;
    Object.defineProperty(req, "parameters", {
      get: function () {
        return _params.clone();
      },
      set: function (o) {
        _params = new Parameters(o);
      }
    });
    req.parameters = _.merge({}, req.body, req.query, req.params);
    next();
  };
};

export default strongParams;
