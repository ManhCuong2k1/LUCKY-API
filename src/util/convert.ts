

export const convertNumberFields = (data: any, fields: string[]) => {
    data.forEach((item: any) => {
        fields.forEach(field => {
            if (typeof item[field] == "string") {
                item[field] = parseInt(item[field]);
            }
        });
    });

    return data;
};

export const removeFields = (data: any, fields: string[]) => {
    data.forEach((item: any) => {
        fields.forEach(field => {
            if (item[field] !== undefined) {
                delete item[field];
            }
        });
    });

    return data;
};

export const excludeFields = (data: any[], fields: string[]) => {
    return data.map((item: any) => {
        const itemJson = item.toJSON();
        fields.forEach(field => {
            delete itemJson[field];
        });

        return itemJson;
    });
};

export const extractOnlyFields = (data: any, fields: string[]) => {
    data.forEach((item: any) => {
        const newItem: any = {};
        fields.forEach(field => {
            newItem[field] = item[field];
        });

        item = newItem;
    });

    return data;
};