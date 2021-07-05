// export const User

export const SUCCESS_PROCEDURE_RESPONSE_CODE = 1;
export const UPDATE_SUCCESS_RESPONSE_TEXT = "Cập nhật thành công";
export const INSERT_SUCCESS_RESPONSE_TEXT = "Thêm mới thành công";
export const UPDATE_FAIL_RESPONSE_TEXT = "Cập nhật thất bại. Vui lòng thử lại sau!";

export const ERROR_CODES = {
    InvalidLoginCredentials: "INVALID_LOGIN_CREDENTIALS",
    InvalidOrExpiredToken: "INVALID_OR_EXPIRED_TOKEN",
    SomeErrorsOccurredPleaseTryAgain: "SOME_ERROR_OCCURRED_PLEASE_TRY_AGAIN",
    NoPermissionToAccessThisResource: "NO_PERMISSION_TO_ACCESS_THIS_RESOURCE"
};

export const ERROR_MESSAGES = {
    OperatorNameExist: "Tên nhà mạng đã được sử dụng",
    OperatorCodeExist: "Mã nhà mạng đã được sử dụng",
    CardCodeExist: "Mã thẻ cào đã tồn tại",
    PeriodTimeOverlap: "Khoảng thời gian cấu hình không hợp lệ",
    SystemProccessing: "Hệ thống của chúng tôi đang bận .Xin quý khách vui lòng thử lại sau",
    GiftCodeExpireDateMin: "Ngày giờ hết hiệu lực phải lớn hơn ngày giờ hiện tại",
    AdminNotEnoughMoneyToCreateGiftCode: "Tài khoản không đủ Bit để tạo gift code",
    CampaignExist: "Chiến dịch tạo gift code đã tồn tại",
    CampaignInvalid: "Chiến dịch không hợp lệ",
    CSKHExist: "Tài khoản chăm sóc khách hàng đã tồn tại"
};

export const MESSAGE_GIFT_CODE_ADD_MAP: any = {
    "-17": ERROR_MESSAGES.CampaignExist,
    "-303": ERROR_MESSAGES.CampaignInvalid,
    "default": ERROR_MESSAGES.SystemProccessing
};

export const URL_REGEX_PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&=]*)/g;

export const CRAWL_DISCOUNT_CATEGORY: any = [
    {
      id: "8322",
      name: "Nha Sach",
      string: "bookstore",
    },
    {
      id: "4384",
      name: "Bach Hoa",
      string: "grocery",
    },
    {
      id: "44792",
      name: "Thuc Pham - Tuoi Song",
      string: "food",
    },
    {
      id: "1520",
      name: "Lam Dep - va Khoe",
      string: "beauty_health",
    },
    {
      id: "2549",
      name: "Do Choi - Me va Be",
      string: "toy_mother_and_baby",
    },
    {
      id: "1883",
      name: "Nha Cua - Doi Song",
      string: "house_life",
    },
    {
      id: "1882",
      name: "Dien Gia Dung",
      string: "electric_appliances",
    },
    {
      id: "4221",
      name: "Dien Tu - Dien Lanh",
      string: "electronics",
    },
    {
      id: "1789",
      name: "Dien Thoai - May Tinh Bang",
      string: "phone_tablet",
    },
    {
      id: "1815",
      name: "Thiet Bi Ki Thaut So",
      string: "digital_equipment",
    },
    {
      id: "1846",
      name: "Lap Top - May Tinh Ban",
      string: "laptop_computer",
    },
    {
      id: "1801",
      name: "May Anh - May Quay Phim",
      string: "camera",
    },
    {
      id: "8594",
      name: "Xe - Phu Kien",
      string: "vehicle",
    },
    {
      id: "1975",
      name: "The Thao",
      string: "sports",
    },
    {
      id: "17166",
      name: "Do Ngoai Dia",
      string: "exotic",
    },
    {
      id: "931",
      name: "Thoi Trang Nu",
      string: "fashion_female",
    },
    {
      id: "915",
      name: "Thoi Trang Nam",
      string: "fashion_female",
    },
    {
      id: "1703",
      name: "Giay Dep Nu",
      string: "women_shoe",
    },
    {
      id: "1686",
      name: "Giay Dep Nam",
      string: "men_shoe",
    },
    {
      id: "976",
      name: "Tui Thoi Trang Nu",
      string: "women_bag",
    },
    {
      id: "27616",
      name: "Tui Thoi Trang Nam",
      string: "men_bag",
    },
    {
      id: "6000",
      name: "Balo - Vali",
      string: "balo_vali",
    },
    {
      id: "27498",
      name: "Phu Kien Thoi Trang",
      string: "fashion_accessories",
    },
    {
      id: "8371",
      name: "Dong Ho - Trang Suc",
      string: "watches_jewelry",
    },
  ];
