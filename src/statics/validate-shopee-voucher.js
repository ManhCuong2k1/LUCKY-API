// @ts-nocheck
/* eslint-disable */ 

(() => {
    const formatDate = function(to, from = new Date()) {
        to = new Date(to);
        const diff = (to - from) / 1000;
        if (diff < 0) return "-";
    
        let d = [];
        const p = [];
    
        d.push({key: "ngày", value: Math.floor(diff / 86400)});
        d.push({key: "giờ", value: Math.floor(diff / 3600)});
        d.push({key: "phút", value: Math.floor(diff / 60)});
        d.push({key: "giây", value: Math.round(diff)});
    
        d = d.filter(item => item.value > 0)[0];
    
        if (d != undefined) {
            return d.value + " " + d.key;
        }
    
        return "-";
    };
    
    const copyVoucherCode = function () {
        const element = this;
        const voucherCode = element.dataset.code;
        const tempInput = document.createElement("input");
        tempInput.style = "position: absolute; left: -1000px; top: -1000px";
        tempInput.value = voucherCode;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
    
        element.innerHTML = "Đã copy";
        setTimeout(function() {
            element.innerHTML = "Copy mã";
        }, 1000);
    };
    
    const numberTwoDigital = function(n) {
        return n<10? "0"+n:""+n;
    };
    
    const checkVoucher = function(moVoucherslist, moVoucher, moProductInfo, loadingPercent, isNearEndVoucher, isLastVoucher = false) {
        const loadingTitle = document.getElementById("cps-loading-title");
        const progressBar = document.getElementById("cps-progress-bar");
    
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const moResponse = JSON.parse(xhr.response);
                    const moVoucherData = moResponse["data"];
                    if (moVoucherData.length !== 0) {
                        let moTypeColor = "#ee3916";
                        let moDuration = "";
                        let moTitle = "";
                        if (moVoucherData.voucher_type == "Giảm giá") {
                            if (moVoucherData.voucher_discount > 100) {
                                moTitle = `Giảm ${Math.round(moVoucherData.voucher_discount/1000)}K Đơn tối thiểu ${Math.round(moVoucherData.voucher_min_spend/1000)}K`;
                            }
                            else {
                                moTitle = `Giảm ${moVoucherData.voucher_discount}% Đơn tối thiểu ${Math.round(moVoucherData.voucher_min_spend/1000)}K`;
                            }
                            if (moVoucherData.voucher_reward_cap !== 0) {
                                moTitle += ` Giảm tối đa ${Math.round(moVoucherData.voucher_reward_cap/100000000)}K`;
                            }
                        }
                        else if (moVoucherData.voucher_type == "Hoàn xu") {
                            moTypeColor = "#d0021b";
                            if (moVoucherData.voucher_discount > 100) {
                                moTitle = `Hoàn ${Math.round(moVoucherData.voucher_discount/1000)}K xu Đơn tối thiểu ${Math.round(moVoucherData.voucher_min_spend/1000)}K`;
                            }
                            else {
                                moTitle = `Hoàn ${moVoucherData.voucher_discount}% Đơn tối thiểu ${Math.round(moVoucherData.voucher_min_spend/1000)}K`;
                            }
                            if (moVoucherData.voucher_reward_cap !== 0) {
                                moTitle += ` Hoàn tối đa ${Math.round(moVoucherData.voucher_reward_cap/1000)}K xu`;
                            }
                        }
                        if (new Date(moVoucherData.voucher_start_time) > new Date()) {
                            let start  = new Date(moVoucherData.voucher_start_time);
                            start = [start.getHours(),
                                    numberTwoDigital(start.getMinutes())].join("h") + " " +
                                    [numberTwoDigital(start.getDate()),
                                    numberTwoDigital(start.getMonth()+1),
                                    start.getFullYear()].join("/");
                            moDuration = ` - <span style="color: #1d7be1;">Hiệu lực từ: ${start}</span>`;
                        }
                        else {
                            moDuration = ` - <span style="color: #ff1424;">Hết hạn sau: ${formatDate(moVoucherData.voucher_end_time)}</span>`;
                        }
    
                        const moVoucherHtml = `
                        <div class="cps-voucher-row">
                            <div class="cps-voucher-wrap">
                                <div class="cps-voucher-left">
                                    <div class="cps-voucher-image">
                                        <div class="cps-voucher-icon" style="background-image: url('${moVoucherData.voucher_icon}'); background-size: contain; background-repeat: no-repeat;"></div>
                                    </div>
                                    <div class="cps-voucher-icon-text">${moVoucherData.voucher_icon_text}</div>
                                    <div class="cps-voucher-border-left">
                                        <div class="cps-border-left"></div>
                                    </div>
                                </div>
                                <div class="cps-voucher-right">
                                    <div class="cps-voucher-title">
                                        <div class="cps-voucher-type">
                                            <span class="cps-badge" style="background: ${moTypeColor};">
                                                ${moVoucherData.voucher_type}
                                            </span>
                                        </div>
                                        <div class="cps-voucher-title-text">${moTitle}</div>
                                    </div>
                                    <div></div>
                                    <span class="cps-voucher-note">
                                        <div class="cps-voucher-pregress">
                                            <div style="width: ${(100 - moVoucherData.voucher_percentage_used)}%; height: 100%; background: linear-gradient(270deg, rgb(255, 176, 0) 0%, rgb(235, 23, 23) 100%);"></div>
                                        </div>
                                        <div class="cps-voucher-duration">
                                            <span class="cps-voucher-percent-used">Còn lại ${(100 - moVoucherData.voucher_percentage_used) + "%"}</span>
                                            <span class="cps-duration-text">${moDuration}</span>
                                            <div class="cps-voucher-detail-link">
                                                <a class="cps-tooltip" href="${moVoucherData.voucher_detail_link + "&aff_sub1=BGG_MOPLUGIN&amp;aff_sub2=SEARCH&amp;aff_sub3=&amp;aff_sub4="}" target="_blank">
                                                    Chi tiết >>
                                                    <span class="cps-tooltiptext">${moVoucherData.voucher_description}</span>
                                                </a>
                                            </div>
                                            <a class="cps-btn-get-voucher" href="${moVoucherData.voucher_link + "&aff_sub1=BGG_MOPLUGIN&amp;aff_sub2=SEARCH&amp;aff_sub3=&amp;aff_sub4="}" data-code="${moVoucherData.voucher_code}" target="_blank">
                                                Copy mã
                                            </a>
                                        </div>
                                    </span>
                                </div>
                            </div>
                        </div>`;
                        moVoucherslist.insertAdjacentHTML("beforeend", moVoucherHtml);
                        const moGetVouchers = document.getElementsByClassName("cps-btn-get-voucher");
                        for (let i = 0; i < moGetVouchers.length; i++) {
                            moGetVouchers[i].addEventListener("click", copyVoucherCode);
                        }
                    }
                }
                if (isLastVoucher) {
                    if (moVoucherslist.childElementCount == 0) {
                        loadingTitle.innerHTML = "Kiểm tra hoàn tất. Không tìm thấy mã nào phù hợp";
                    }
                    else {
                        loadingTitle.innerHTML = "Kiểm tra hoàn tất. Tìm thấy " + moVoucherslist.childElementCount + " mã phù hợp";
                    }
                    progressBar.innerHTML = "100%";
                    document.getElementById("cps-btn-search-voucher").disabled = false;
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST", "https://promotion-api.masoffer.net" + "/v1/promotion/delete-from-cart");
                    xhr.send(JSON.stringify({ "product_info": moProductInfo }));
                    progressBar.style.width = progressBar.innerHTML;
                }
                else if (isNearEndVoucher) {
                    isNearEndVoucher = false;
                    const isLastVoucher = true;
                    setTimeout(() => {
                        checkVoucher(moVoucherslist, moVoucher, moProductInfo, loadingPercent, isNearEndVoucher, isLastVoucher);
                    }, 500);
                }
                else {
                    loadingPercent = Math.round((parseFloat(progressBar.innerHTML.slice(0, -1)) + loadingPercent) * 100) / 100;
                    loadingTitle.innerHTML = "Đang kiểm tra mã " + moVoucher.voucher_code;
                    progressBar.innerHTML = (loadingPercent < 100 ? loadingPercent : 100) + "%";
                    progressBar.style.width = progressBar.innerHTML;
                }
            }
        };
        xhr.open("POST", "https://luckyhand.online/validate-voucher");
        xhr.send(JSON.stringify({
            "voucher": moVoucher,
            "product_info": moProductInfo,
            "publisher_token": "/1sPEclbNOO621k2zZO2vQ==",
            "domain": "go.bloggiamgia.vn",
            "encoded_publisher_id": "MGUYSvZ9xgl_dGJ8LUf8WA"
        }));
    };
    
    const moRecommendVoucherCss = `
    <style type="text/css">
        @import  url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap');
        .cps-show {
            display: block!important;
        }
        .cps-wrap {
            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
            width: 100%;
            margin: 0;
            padding: 0;
            border: 0;
            vertical-align: baseline;
            position: relative;
            color: #333333;
            z-index: 998;
        }
        .cps-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            width: 100%;
            margin-bottom: 10px;
        }
        #cps-search-form {
            display: flex;
            flex-wrap: wrap;
            height: 45px;
            width: 100%;
            margin-bottom: 5px;
        }
        #cps-error-message {
            color: #dc3545;
            font-size: 12px;
        }
        #cps-search-form input {
            font-size: 12px;
            border-radius: 2px;
            width: 80%;
            height: 100%;
            outline: none;
        }
        #cps-search-form .cps-search-btn {
            font-size: 12px;
            height: 100%;
            width: 15%;
            display: inline-block;
            font-weight: 400;
            text-transform: none;
            text-align: center;
            vertical-align: middle;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            background-color: transparent;
            border: 1px solid transparent;
            padding: 4px 8px;
            line-height: 1.5;
            border-radius: 3px;
            color: #fff;
            background-color: #28a745;
            border-color: #28a745;
            margin-left: 4%;
            margin-right: 0;
            cursor: pointer;
        }
        #cps-search-form .cps-search-btn:hover, #cps-search-form .cps-search-btn:focus {
            outline: none;
            text-decoration: none;
            background-color: #36a04e;
        }
        #cps-loading-title {
            margin-top: 10px;
            margin-bottom: 2px;
            font-size: 15px;
        }
        #cps-loading-bar {
            display: none;
            width: 100%;
            height: 20px;
            overflow: hidden;
            font-size: 13px;
            background-color: #e9ecef;
            border-radius: 5px;
        }
        #cps-loading-bar .cps-progress-bar {
            display: -ms-flexbox;
            display: flex;
            -ms-flex-direction: column;
            flex-direction: column;
            -ms-flex-pack: center;
            justify-content: center;
            height: 100%;
            color: #fff;
            text-align: center;
            white-space: nowrap;
            background-color: #007bff;
            transition: width .6s ease;
        }
        #cps-loading-bar .cps-progress-bar-striped {
            background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
            background-size: 10px 10px;
        }
        #cps-vouchers {
            width: 100%;
            max-width: 580px;
            margin: auto;
            margin-top: 20px;
        }
        #cps-vouchers a {
            text-decoration: none !important;
        }
    
        /* CSS for loading */
        .cps-overlay {
            background: #fdfdfd;
            display: none;
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            opacity: 0.5;
        }
        .cps-loading .cps-overlay {
            display: block;
        }
        .cps-loading .cps-con-loading {
            display: flex;
        }
        .cps-con-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            flex-direction: row;
            z-index: 1000;
        }
        .cps_loading__letter {
            font-size: 25px;
            font-weight: normal;
            letter-spacing: 4px;
            text-transform: uppercase;
            font-family: 'Open Sans';
            color: #ee4d2d;
            animation-name: cps-bounce;
            animation-duration: 2s;
            animation-iteration-count: infinite;
        }
        @keyframes  cps-bounce {
            0% {
                transform: translateY(0px);
            }
            40% {
                transform: translateY(-30px);
            }
            80%,
            100% {
                transform: translateY(0px);
            }
        }
        .cps_loading__letter:nth-child(2) {
            animation-delay: 0.1s;
        }
        .cps_loading__letter:nth-child(3) {
            animation-delay: 0.2s;
        }
        .cps_loading__letter:nth-child(4) {
            animation-delay: 0.3s;
        }
        .cps_loading__letter:nth-child(5) {
            animation-delay: 0.4s;
        }
        .cps_loading__letter:nth-child(6) {
            animation-delay: 0.5s;
        }
        .cps_loading__letter:nth-child(7) {
            animation-delay: 0.6s;
        }
        .cps_loading__letter:nth-child(8) {
            animation-delay: 0.8s;
        }
        .cps_loading__letter:nth-child(9) {
            animation-delay: 1s;
        }
        .cps_loading__letter:nth-child(10) {
            animation-delay: 1.1s;
        }
        .cps_loading__letter:nth-child(11) {
            animation-delay: 1.2s;
        }
        /* CSS for tooltip */
        #cps-vouchers .cps-tooltip {
            position: relative;
            color: #ee3916;
            font-weight: 600;
        }
        #cps-vouchers .cps-tooltip:hover {
            color: #f25031;
            text-decoration: underline!important;
        }
        #cps-vouchers .cps-tooltip:focus {
            color: #f25031;
            border: none!important;
        }
        #cps-vouchers .cps-tooltip .cps-tooltiptext {
            visibility: hidden;
            width: 220px;
            background-color: black;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 5px 10px;
            position: absolute;
            z-index: 1;
            top: 100%;
            left: 5%;
            transform: translate(-50%, 0);
        }
        #cps-vouchers .cps-tooltip:hover .cps-tooltiptext {
            visibility: visible;
            outline: none;
        }
        #cps-vouchers .cps-voucher-row {
            width: 100%;
            position: relative;
            margin-bottom: 15px;
        }
        #cps-vouchers .cps-voucher-wrap {
            display: -webkit-box;
            display: -webkit-flex;
            display: -moz-box;
            display: -ms-flexbox;
            display: flex;
            overflow: hidden;
            border-radius: 2px;
            position: relative;
            overflow: visible;
            box-shadow: 2px 2px 5px rgb(0 0 0 / 7%);
            padding: 0;
            width: 100%;
            height: 118px;
        }
        #cps-vouchers .cps-voucher-left {
            position: relative;
            display: -webkit-box;
            display: -webkit-flex;
            display: -moz-box;
            display: -ms-flexbox;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -webkit-flex-direction: column;
            -moz-box-orient: vertical;
            -moz-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
            -webkit-box-pack: center;
            -webkit-justify-content: center;
            -moz-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            -webkit-box-align: center;
            -webkit-align-items: center;
            -moz-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            width: 118px;
            height: 118px;
            position: relative;
            display: flex;
            background: -webkit-gradient(linear,left top,right top,color-stop(0,transparent),color-stop(3px,transparent),color-stop(4px,#ee3916));
            background: linear-gradient(90deg,transparent 0,transparent 3px,#ee3916 4px);
            background-origin: border-box;
            border-top: 1px solid #e8e8e8;
            border-bottom: 1px solid #e8e8e8;
            border-right: 1px dashed #e8e8e8;
        }
        #cps-vouchers .cps-voucher-image {
            position: relative;
            height: 56px;
            width: 56px;
            position: relative;
            overflow: hidden;
            border-radius: 50%;
        }
        #cps-vouchers .cps-voucher-icon {
            opacity: 1;
            -webkit-transition: opacity .2s ease;
            transition: opacity .2s ease;
            width: 100%;
            height: 100%;
        }
        #cps-vouchers .cps-voucher-icon-text {
            overflow: hidden;
            display: -webkit-box;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            font-size: 12px;
            line-height: 14px;
            max-height: 30px;
            max-width: 90%;
            text-align: center;
            -webkit-box-pack: center;
            word-break: break-word;
            margin-top: 5px;
            padding: 0 8px;
            padding-bottom: 2px;
            color: #fff;
        }
        #cps-vouchers .cps-voucher-border-left {
            top: 0;
            left: 0;
            position: absolute;
            width: 4px;
            height: 100%;
        }
        #cps-vouchers .cps-voucher-border-left:before {
            top: 0;
        }
        #cps-vouchers .cps-voucher-border-left:after {
            bottom: 0;
        }
        #cps-vouchers .cps-voucher-border-left:after, #cps-vouchers .cps-voucher-border-left:before {
            content: "";
            position: absolute;
            width: 100%;
            height: 3px;
            border-left: 1px solid #e8e8e8;
            background: #ee3916;
        }
        #cps-vouchers .cps-border-left {
            position: absolute;
            top: 3px;
            left: 0;
            width: 4px;
            height: -webkit-calc(100% - 6px);
            height: calc(100% - 6px);
            background: radial-gradient(circle at 0,at 6px,transparent 0,rgba(0,0,0,.03) 3px,#e8e8e8 0,#e8e8e8 4px,#ee3916 0);
            background: radial-gradient(circle at 0 6px,transparent 0,rgba(0,0,0,.03) 3px,#e8e8e8 0,#e8e8e8 4px,#ee3916 0);
            background-size: 4px 10px;
            background-repeat: repeat-y;
        }
        #cps-vouchers .cps-border-left:before {
            content: "";
            top: 0;
            left: 0;
            height: 100%;
            background: repeating-linear-gradient(#e8e8e8,#e8e8e8 2px,transparent 0,transparent 10px);
            background-size: 1px 10px;
            position: absolute;
            width: 1px;
        }
        #cps-vouchers .cps-voucher-right {
            position: relative;
            display: -webkit-box;
            display: -webkit-flex;
            display: -moz-box;
            display: -ms-flexbox;
            display: flex;
            min-width: 0;
            height: -webkit-calc(100% - 2px);
            height: calc(100% - 2px);
            background: #fff;
            border-radius: 0 2px 2px 0;
            border: 1px solid #e8e8e8;
            border-left: 0 solid transparent;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -webkit-flex-direction: column;
            -moz-box-orient: vertical;
            -moz-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
            padding: 0 15px;
            -webkit-box-flex: 1;
            -webkit-flex: 1;
            -moz-box-flex: 1;
            -ms-flex: 1;
            flex: 1;
            -webkit-box-pack: center;
            -webkit-justify-content: center;
            -moz-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            height: 100%;
        }
        #cps-vouchers .cps-badge, #cps-vouchers .cps-voucher-type {
            -webkit-box-pack: center;
            -webkit-justify-content: center;
            -moz-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            -webkit-box-align: center;
            -webkit-align-items: center;
            -moz-box-align: center;
            -ms-flex-align: center;
            align-items: center;
        }
        #cps-vouchers .cps-voucher-type {
            display: -webkit-inline-box;
            display: -webkit-inline-flex;
            display: -moz-inline-box;
            display: -ms-inline-flexbox;
            display: inline-flex;
            vertical-align: middle;
            height: 20px;
            margin-right: 4px;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }
        #cps-vouchers .cps-badge {
            color: #fff;
            border-radius: 2px;
            padding: 0 6px;
            font-size: 12px;
            font-weight: 300;
            height: 18px;
            display: -webkit-box;
            display: -webkit-flex;
            display: -moz-box;
            display: -ms-flexbox;
            display: flex;
        }
        #cps-vouchers .cps-voucher-title, #cps-vouchers .cps-voucher-title-text {
            font-weight: 500;
            color: rgba(0,0,0,.87);
            word-break: break-word;
        }
        #cps-vouchers .cps-voucher-title {
            font-size: 16px;
            overflow: hidden;
            display: -webkit-box;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            line-height: 20px;
            max-height: 43px;
        }
        #cps-vouchers .cps-voucher-title-text {
            display: inline;
        }
        #cps-vouchers .cps-voucher-note {
            line-height: 14px;
            margin-top: 5px;
            color: rgba(0,0,0,.54);
            text-overflow: ellipsis;
            white-space: nowrap;
            margin: 5px 5px 0 0;
        }
        #cps-vouchers .cps-voucher-pregress {
            width: 100%;
            height: 4px;
            background: rgba(0,0,0,.09);
            border-radius: 4px;
            overflow: hidden;
        }
        #cps-vouchers .cps-voucher-duration {
            font-size: 12px;
            display: -webkit-flex;
            display: -moz-box;
            display: -ms-flexbox;
            display: flex;
            display: -webkit-box;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            white-space: normal;
            margin-top: 4px;
        }
        #cps-vouchers .cps-voucher-percent-used {
            color: #ff1424;
            font-weight: 500;
        }
        #cps-vouchers .cps-duration-text {
            color: #ff1424;
        }
        #cps-vouchers .cps-voucher-detail-link {
            display: block;
            font-style: italic;
            margin-top: 10px;
        }
        #cps-vouchers .cps-btn-get-voucher {
            position: absolute;
            right: 20px;
            bottom: 15px;
            display: inline;
            text-decoration: none;
            font-size: 13px;
            margin: 0;
            padding: 5px 10px;
            cursor: pointer;
            border: 1px solid #ee3916;
            background-color: #ee3916;
            border-style: solid;
            -webkit-appearance: none;
            border-radius: 2px;
            white-space: nowrap;
            box-sizing: border-box;
            color: #fff;
        }
        #cps-vouchers .cps-btn-get-voucher:hover {
            color: #fff;
            background-color: #f04c2c;
            border-color: #f04c2c;
        }
        @media  only screen and (max-width: 575px) {
            #cps-search-form {
                display: contents;
            }
            #cps-search-form input {
                width: 100%;
                height: 40px;
                margin-bottom: 0;
            }
            #cps-search-form .cps-search-btn {
                width: 100%;
                margin-left: 0;
                margin-top: 10px;
                height: 30px;
            }
            #cps-error-message {
                margin: 10px 0;;
            }
            #cps-vouchers .cps-voucher-wrap {
                height: 100px;
            }
            #cps-vouchers .cps-voucher-left {
                width: 100px;
                height: 100px;
            }
            #cps-vouchers .cps-voucher-title {
                font-size: 12px;
                line-height: 13px;
            }
            #cps-vouchers .cps-voucher-duration {
                font-size: 9px;
            }
            #cps-vouchers .cps-btn-get-voucher {
                font-size: 10px;
                bottom: 8px;
                padding: 2px 5px;
            }
            #cps-vouchers .cps-voucher-detail-link {
                margin-top: 7px;
            }
            #cps-vouchers .cps-badge {
                font-size: 10px;
                height: 16px;
            }
        }
    </style>`;
    
    const moRecommendVoucherHtml = `
    <div class="cps-wrap" id="cps-wrap">
        <div class="cps-title">
            Tìm kiếm mã giảm giá Shopee
        </div>
        <div id="cps-search-form">
            <input type="text" name="cps_search_url" id="cps-search-url" class="form-control" value="" placeholder="Nhập link sản phẩm để tìm kiếm voucher" required="" autocomplete="on" onClick="this.setSelectionRange(0, this.value.length);">
            <button class="cps-search-btn" id="cps-btn-search-voucher">Tìm kiếm</button>
        </div>
        <div id="cps-error-message"></div>
        <div id="cps-loading-title"></div>
        <div id="cps-loading-bar">
            <div id="cps-progress-bar" class="cps-progress-bar cps-progress-bar-striped" style="width: 0%;">0%</div>
        </div>
        <div id="cps-vouchers"></div>
        <div class="cps-overlay">
        </div>
        <div class="cps-con-loading">
            <div class="cps_loading__letter">Đ</div>
            <div class="cps_loading__letter">a</div>
            <div class="cps_loading__letter">n</div>
            <div class="cps_loading__letter">g</div>
            <div class="cps_loading__letter">&nbsp;</div>
            <div class="cps_loading__letter">T</div>
            <div class="cps_loading__letter">ả</div>
            <div class="cps_loading__letter">i</div>
            <div class="cps_loading__letter">.</div>
            <div class="cps_loading__letter">.</div>
            <div class="cps_loading__letter">.</div>
        </div>
    </div>`;
    const meta = document.createElement("meta");
    meta.setAttribute("name", "viewport");
    meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1");
    document.getElementsByTagName("head")[0].appendChild(meta);
    const moRecommendVoucherElement       = document.getElementById("mo-recommend-widget-54778");
    moRecommendVoucherElement.innerHTML = moRecommendVoucherCss + moRecommendVoucherHtml;
    document.addEventListener("click", function (e) {
        const moWrap = document.getElementById("cps-wrap");
        const moSearchInput  = document.getElementById("cps-search-url");
        const moErrorMessage = document.getElementById("cps-error-message");
        const moVoucherslist = document.getElementById("cps-vouchers");
        const loadingBar     = document.getElementById("cps-loading-bar");
        const loadingTitle   = document.getElementById("cps-loading-title");
        const progressBar    = document.getElementById("cps-progress-bar");
        const searchBtn      = document.getElementById("cps-btn-search-voucher");
    
        if (e.target.id === "cps-btn-search-voucher") {
            while(moVoucherslist.firstChild){
                moVoucherslist.removeChild(moVoucherslist.firstChild);
            }
            const moSearchUrl = moSearchInput.value.trim();
            if (moSearchUrl === "") {
                loadingBar.classList.remove("cps-show");
                moErrorMessage.innerHTML = "Vui lòng điền link sản phẩm!";
                return false;
            }
            searchBtn.disabled = true;
            const xhr = new XMLHttpRequest();
            moWrap.classList.toggle("cps-loading");
            loadingBar.classList.add("cps-show");
            loadingTitle.innerHTML = "Đang lấy danh sách mã";
            progressBar.innerHTML = "0%";
            progressBar.style.width = "0%";
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        moErrorMessage.innerHTML = "";
                        const moResponse = JSON.parse(xhr.response);
                        const moVouchersData = moResponse["data"]["vouchers"];
                        const moProductInfo = moResponse["data"]["product_info"];
    
                        if (moVouchersData.length <= 0) {
                            moWrap.classList.toggle("cps-loading");
                            loadingBar.classList.remove("cps-show");
                            loadingTitle.innerHTML = "";
                            moErrorMessage.innerHTML = "Không tìm thấy mã nào phù phợp";
                            return false;
                        }
                        const loadingPercent = 100/moVouchersData.length;
                        loadingTitle.innerHTML = "Chuẩn bị kiểm tra...";
                        progressBar.style.width = "0%";
                        moVouchersData.forEach(function(moVoucher, index) {
                            const isNearEndVoucher = (index == (moVouchersData.length - 2)) ? true : false;
                            setTimeout(() => {
                                checkVoucher(moVoucherslist, moVoucher, moProductInfo, loadingPercent, isNearEndVoucher);
                            }, 500);
                        });
                        moWrap.classList.toggle("cps-loading");
                    } else if (xhr.status === 500) {
                        moWrap.classList.toggle("cps-loading");
                        loadingBar.classList.remove("cps-show");
                        loadingTitle.innerHTML = "";
                        searchBtn.disabled = false;
                        moErrorMessage.innerHTML = "Lỗi trong quá trình check mã. Vui lòng thử lại sau";
                    }
                    else {
                        moWrap.classList.toggle("cps-loading");
                        loadingBar.classList.remove("cps-show");
                        loadingTitle.innerHTML = "";
                        searchBtn.disabled = false;
                        moErrorMessage.innerHTML = JSON.parse(xhr.response).message;
                    }
                }
            };
            xhr.open("GET", "https://promotion-api.masoffer.net" + "/v1/promotion/get?publisher_token=" + encodeURIComponent("/1sPEclbNOO621k2zZO2vQ==") + "&url=" + encodeURIComponent(moSearchUrl));
            xhr.send(null);
        }
    }, false);
    })();
