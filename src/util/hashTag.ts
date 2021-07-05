interface HashTagExtractInterface {
    mentions: string[];
    hashtags: string[];
}

function _getRegexMention(){
    return new RegExp(/(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/_]{1,15})(?:\b(?!@|＠)|$)/igm);
}
function _getRegexHashTag(){
    return new RegExp(/(?:^|[^a-zA-Z0-9_])(?:(?:#)(?!\/))([a-zA-Z0-9/_]+)(?:\b(?!#)|$)/igm);
}
function _unique(arr: any){
    return arr.filter((val: any, i: string, _arr: any) => _arr.indexOf(val) === i);
}

function extract(text: string, options: any) {

    if(options && typeof options === "string"){
        options = { type: options };
    }

    options = options || {};
    options.type = options.type || "@";

    const regex = options.type === "@" ? _getRegexMention() : options.type === "#"
        ? _getRegexHashTag() : options.type.toLowerCase() === "all" ? _getRegexMention() : null;

    if(!regex) throw new Error(`Type ${options.type} is not valid`);

    if(options.type.toLowerCase() === "all"){

        const result: HashTagExtractInterface = {
            mentions: extract(text, {
                type: "@",
                unique: options.unique,
                symbol: options.symbol
            }),
            hashtags: extract(text, {
                type: "#",
                unique: options.unique,
                symbol: options.symbol
            })
        };

        return result;

    }else{
        const results = (text.match(regex) || []).map((result: any) => {
            result = result.replace(/ |\./g, "");
            if(options.symbol !== undefined && options.symbol === false)
                return result.replace(/^(@|#)/, "");

            return result;
        });

        return options.unique ? _unique(results) : results;
    }
}

export {
    extract
};