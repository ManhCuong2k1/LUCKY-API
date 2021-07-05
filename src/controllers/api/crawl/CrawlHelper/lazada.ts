import request from "request";

const getvoucherfreeship = () => {

    try {

        return new Promise((resolve, reject) => {

            const options = {
                "method": "POST",
                "url": "https://acs-m.lazada.vn/h5/mtop.lazada.kangaroo.core.service.route.lzdpagerecommendservice/1.0/?jsv=2.5.1&appKey=24677475&t=1620900210724&sign=16eda0a90d2ab07748a3bc30bdcbd550&api=mtop.lazada.kangaroo.core.service.route.lzdPageRecommendService&v=1.0&timeout=10000&jsonpIncPrefix=kangaroo&type=originaljson&dataType=jsonp&preventFallback=true",
                "headers": {
                "cookie": "t_fv=1622008188269; t_uid=p3APAOIwsjhNq8KBSADwaIUEquW1ZilG; cna=fc80GdNpwiQCAQ7noSQYae4q; hng=VN|vi|VND|704; hng.sig=EmlYr96z9MQGc5b9Jyf9txw1yLZDt_q0EWkckef954s; lzd_cid=ce425a78-dd6e-4154-d898-f31b10141864; _gcl_aw=GCL.1622090490.CjwKCAjw47eFBhA9EiwAy8kzNIvgCbOmiyGZoiubXnZSKwJA77Kt2DDhBoS7GBZXD_yd6IqMcoz0EhoCIjgQAvD_BwE; _gcl_au=1.1.2079930391.1622090490; lzd_sid=15cd92547a4820aeb5f31c3df867adea; _tb_token_=74e8ee1e57333; _ga=GA1.2.151961418.1622090493; _gac_UA-30172376-1=1.1622090493.CjwKCAjw47eFBhA9EiwAy8kzNIvgCbOmiyGZoiubXnZSKwJA77Kt2DDhBoS7GBZXD_yd6IqMcoz0EhoCIjgQAvD_BwE; _fbp=fb.1.1622090493301.1251220498; t_sid=fDvmjcrSmNxR8I1yuBsMqaEEfrSNVzSK; utm_channel=NA; _m_h5_tk=448ec2800f26aec200d5fa61bf388e59_1622369519398; _m_h5_tk_enc=a908174934548a03bb5f199081423a79; xlly_s=1; _uetsid=0697cf70c11811eb8fdb393cecfb5cc5; _uetvid=cfd69410bea511eba4e537c499c50337; tfstk=cNvPBVNgQ5eXnpXI6T6UVAv3QfNRaBYHy-7VZIyGQQDQE-XC7sY0Ji03ji7PWxfl.; isg=BC8v9WtfkxUyOZc1Exapq13Gvko51IP2VY8SWkG8Kx6RkE6SSaADRnCBFpiu6Ftu; l=eBrIp7Mcjk8ZyAApBO5aourza7791IRb8sPzaNbMiInca1WlsnMNLNCCo6Kp-dtjQtCfletrPtSyidEHPN4S9xDDBe2y3H4rnxvO.",
                "Content-Type": "application/x-www-form-urlencoded"
                },
                form: {
                "data": "{\"backupParams\":\"currency,regionId,language,device\",\"device\":\"pc\",\"sequence\":1,\"extParam\":\"{}\",\"language\":\"vi\",\"regionId\":\"vn\",\"currency\":\"vnd\",\"url\":\"https://pages.lazada.vn/wow/gcp/lazada/channel/vn/partnership/uu-dai-doi-tac\",\"pvuuid\":\"\",\"cookie\":\"\"}"
                }
            };
        
            const arrayVoucherFreeship: any = [];

            request(options, function (error, response) {
                if(response.body) {
                    const dataJsonVoucherFreeship = JSON.parse(response.body);
                    const dataVoucherFreeship = dataJsonVoucherFreeship.data.resultValue.data;

                    let i = 0;
                    for(const key in dataVoucherFreeship) {
                       
                        const dataVoucher = dataVoucherFreeship[key].voucherData.vouchers;

                        dataVoucher.forEach((data: any) => {
                            //console.log(data.voucherTitle);
                            arrayVoucherFreeship.push(data);
                        });

                        if(i == 1) { // chỉ hot voucher
                            break;
                        }
                        i++;
                    }

                    resolve(arrayVoucherFreeship);
                }else {
                    reject(error);
                }
            });
        });

    }catch(e) {
        console.log(e);
        return e;
    }
};




const getVoucherbyID = (cartID: any, limit: number) => {

    try {

        return new Promise((resolve, reject) => {

            const options = {
                "method": "POST",
                "url": "https://acs-m.lazada.vn/h5/mtop.lazada.kangaroo.core.service.route.lzdpagerecommendservice/1.0/?jsv=2.5.1&appKey=24677475&t=1620900210724&sign=16eda0a90d2ab07748a3bc30bdcbd550&api=mtop.lazada.kangaroo.core.service.route.lzdPageRecommendService&v=1.0&timeout=10000&jsonpIncPrefix=kangaroo&type=originaljson&dataType=jsonp&preventFallback=true",
                "headers": {
                "cookie": "t_uid=4cec2d3e-09c7-4d4f-c411-04ae3eaaee00; lzd_sid=107f2224949278f08573c8fc00de500e; _tb_token_=3ee7b5a53fa5; hng=VN|vi|VND|704; t_fv=1620898982457; t_sid=IBfkcQTWEQlgYCL7t4dy3f7iRfb4lZWX; utm_channel=NA; _m_h5_tk=94024282381178043182940449d5f8a3_1620909422399; _m_h5_tk_enc=0f97190c76d6445378da397cce29dbfa; cna=p20iGell+GICAXGyJUIRDnSa; _gcl_au=1.1.606292576.1620899945; xlly_s=1; lzd_cid=e18e6ea5-322d-430a-89ca-59db180bdd92; _uetsid=dae754e0b3d111eb9ed53df43a8319fc; _uetvid=587f1d00b15d11eb933bf339a285abe7; isg=BAoK4sZ2XtlJndJxHUFihJlOW_ms-45VPT0cspRD093oR6oBfIv6ZXq2V6ubtwbt; l=eBTsbs8cjAT_izRpBOfwhurza77tGIRAguPzaNbMiOCPO9Cp5FxGW66LVeY9CnMNh6k9R3RAgqZLBeYBYQd-nxvOCUrK9bkmn; tfstk=cm_dBuAWMmACICROgMEgP4pOefPGZT2JCX9oyW9B06GThK3RiM_ck5_0AQMpW5C..; lzd_sid=1601dac18722105b18a9d2ddf2b3b546; _tb_token_=d36fe5d39377; _m_h5_tk=b67f3e218fdcd43692000770c6d474d6_1620908616315; _m_h5_tk_enc=671ef9ee3c95af9e94fc770591c2ca7b",
                "Content-Type": "application/x-www-form-urlencoded"
                },
                form: {
                "data": "{\"backupParams\":\"currency,regionId,language,device\",\"device\":\"pc\",\"sequence\":1,\"extParam\":\"{}\",\"language\":\"vi\",\"regionId\":\"vn\",\"currency\":\"vnd\",\"url\":\"https://pages.lazada.vn/wow/gcp/lazada/channel/vn/partnership/uu-dai-doi-tac\",\"pvuuid\":\"\",\"cookie\":\"\"}"
                }
            };
        
            const arrayVoucherFreeship: any = [];

            request(options, function (error, response) {
                if(response.body) {
                    const dataJsonVoucherFreeship = JSON.parse(response.body);
                    const dataVoucherFreeship = dataJsonVoucherFreeship.data.resultValue.data;

                    let i = 0;
                    for(const key in dataVoucherFreeship) {
                       
                        const dataVoucher = dataVoucherFreeship[key].voucherData.vouchers;

                        dataVoucher.forEach((data: any) => {
                            //console.log(data.voucherTitle);
                            arrayVoucherFreeship.push(data);
                        });

                        if(i == 1) { // chỉ hot voucher
                            break;
                        }
                        i++;
                    }

                    resolve(arrayVoucherFreeship);
                }else {
                    reject(error);
                }
            });
        });

    }catch(e) {
        console.log(e);
        return e;
    }
};





export default {
    getvoucherfreeship,
    getVoucherbyID
};