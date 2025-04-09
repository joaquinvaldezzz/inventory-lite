/**
 * Flattens a TypeScript type for improved readability.
 *
 * TypeScript sometimes displays deeply nested or extended types in a complex way. `Prettify<T>`
 * simplifies and flattens the type, making it easier to read in editor tooltips.
 *
 * @template T - The type to be prettified.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Generic structure for API responses.
 *
 * @template T - The type of the `data` property in the response.
 */
interface APIResponse<T> {
  /** Indicates whether the API request was successful. */
  success: boolean;

  /** Message describing the result of the API request. */
  message: string;

  /** The actual data returned by the API. */
  data: T;
}

/** Represents a branch that a user has access to. */
export interface Branch {
  /** Unique identifier of the branch. */
  id: string | number;

  /** Name of the branch. */
  branch: string;
}

/** Structure of the data returned in a successful login response. */
interface LoginData {
  /** Authentication token for the logged-in user. */
  token: string;

  /** Details of the authenticated user. */
  user: {
    /** Unique identifier of the user. */
    id: string;

    /** Full name of the user. */
    name: string;

    /** Email address of the user. */
    email: string;

    /** User level or role within the system. */
    level: string;

    /** Access permissions for various modules. */
    access: [
      {
        /** Name of the module. */
        module_name: string;

        /** Read permission for the module. */
        read: string;

        /** Write permission for the module. */
        write: string;

        /** Edit permission for the module. */
        edit: string;

        /** Delete permission for the module. */
        delete: string;
      },
    ];

    /** List of branches the user has access to. */
    branches: Branch[];
  };
}

/** API response for a successful login attempt. */
export type LoginResponse = Prettify<APIResponse<LoginData>>;

export interface DeliveryResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    po_no: string;
    dr_no: string | null;
    branch_id: number;
    branch: string;
    supplier_id: number;
    supplier_name: string;
    date_request: string;
    date_order: string;
    date_delivered: string;
    remarks: string;
    status_id: number;
    status: string;
    count: number;
    total_amount: number;
  };
}

export type DeliveryItem = DeliveryResponse["data"];

export interface AddDeliveryItem {
  supplier: number;
  date_request: string;
  date_order: string;
  date_delivered: string;
  date_received: string;
  grand_total: number;
  remarks: string;
  status: number;
  items: Array<{
    item: number;
    quantity_po: number;
    quantity_actual: number;
    unit_po: string;
    quantity_dr: number;
    unit_dr: string;
    price: number;
    total_amount: number;
  }>;
}

export interface DeliveryRecord {
  id: number;
  po_no: string;
  dr_no: string;
  branch_id: number;
  branch: string;
  supplier_id: number;
  supplier_name: string;
  date_request: string;
  date_order: string;
  date_delivered: string;
  payment_type_id: number;
  payment_type: string;
  remarks: string;
  status_id: number;
  status: string;
  count: number;
  total_amount: number;
  items: Array<{
    id: number;
    purchase_id: number;
    date_request: string;
    date_order: string;
    date_delivered: string;
    date_received: string;
    branch_id: number;
    branch: string;
    supplier_id: number;
    supplier_name: string;
    item_id: number;
    barcode: string;
    raw_material: string;
    raw_material_type_id: number;
    raw_material_type: string;
    sku: string;
    packaging: string;
    quantity_po: number;
    quantity_actual: number;
    unit_po: string;
    quantity_dr: number;
    unit_dr: string;
    quantity: number;
    unit: string;
    price: number;
    total_amount: number;
    remarks: string;
    status: number;
  }>;
}

/** Represents a supplier response. */
export interface SupplierResponse {
  /** Indicates if the request was successful. */
  success: boolean;

  /** Message associated with the response. */
  message: string;

  /** Array of supplier data. */
  data: Array<{
    /** Unique identifier for the supplier. */
    id: number;

    /** Name of the supplier. */
    supplier_name: string;

    /** Last name of the supplier. */
    lastname: string;

    /** First name of the supplier. */
    firstname: string;

    /** Middle name of the supplier. */
    middlename: string;

    /** Address of the supplier. */
    address: string;

    /** Mobile phone number of the supplier. */
    mobile: string;

    /** Landline phone number of the supplier. */
    landline: string;

    /** Email address of the supplier. */
    email: string;

    /** Tax Identification Number of the supplier. */
    tin: string;

    /**
     * VAT type of the supplier.
     *
     * @default "NON-VAT"
     */
    vat_type: "NON-VAT";

    /**
     * Currency used by the supplier.
     *
     * @default "PHP"
     */
    currency: "PHP";
  }>;
}

/**
 * Represents a Supplier type which is derived from the 'data' property of the SupplierResponse
 * type.
 */
export type Supplier = SupplierResponse["data"];

export interface ItemsResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: number;
    barcode: string;
    raw_material: string;
    raw_material_type: number;
    sku: string;
    unit: string;
    packaging: string;
    raw_material_location: string;
    delivery_lead_time: string;
    minimum_stock_level: number;
    maximum_stock_level: number;
    initial_stock_level: number;
  }>;
}

export type Items = ItemsResponse["data"];

export interface DailyCountResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    branch_id: number;
    branch: string;
    branch_name: string;
    raw_material_type_id: number;
    raw_material_type: string;
    date: string;
    timestamp: string;
  };
}

export type DailyCountData = DailyCountResponse["data"];

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    raw_material_type: string;
  };
}

export type Categories = CategoriesResponse["data"];

export interface IngredientsResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    barcode: string;
    raw_material: string;
    raw_material_type: number;
    sku: string;
    unit: string;
    packaging: string;
    raw_material_location: string;
    delivery_lead_time: string;
    minimum_stock_level: number;
    maximum_stock_level: number;
    initial_stock_level: number;
  };
}

export type Ingredients = IngredientsResponse["data"];

export interface DailyCountRecordResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    branch_id: number;
    branch: string;
    branch_name: string;
    raw_material_type_id: number;
    raw_material_type: string;
    date: string;
    timestamp: string;
    items: Array<{
      id: number;
      inventory_count_id: number;
      branch_id: number;
      branch: string;
      branch_name: string;
      date: string;
      raw_material_type_id: number;
      raw_material_type: string;
      item_id: number;
      barcode: string;
      item: string;
      unit: string;
      count: number;
    }>;
  };
}

export type DailyCountRecord = DailyCountRecordResponse["data"];

export interface WasteData {
  id: number;
  branch_id: number;
  branch: string;
  branch_name: string;
  waste_type: string;
  raw_material_type_id: number;
  raw_material_type: string;
  date: string;
}

export type WasteResponse = Prettify<APIResponse<WasteData>>;

export interface WasteRecordData {
  id: number;
  branch_id: number;
  branch: string;
  branch_name: string;
  waste_type: string;
  raw_material_type_id: number;
  raw_material_type: string;
  date: string;
  items: Array<{
    id: number;
    inventory_waste_id: number;
    branch_id: number;
    branch: string;
    branch_name: string;
    date: string;
    raw_material_type_id: number;
    raw_material_type: string;
    item_id: number;
    barcode: string;
    item: string;
    unit: string;
    waste: number;
    reason: string;
    employee: string;
  }>;
}

export type WasteRecordResponse = Prettify<APIResponse<WasteRecordData[]>>;

export interface EmployeeData {
  EmployeeID: string;
  CompanyID: string;
  LastName: string;
  FirstName: string;
  MiddleName: string;
  Picture: string;
  CityAddress: string;
  ProvAddress: string;
  BirthDate: string;
  BirthPlace: string;
  Gender: string;
  ContactNo: string;
  CivilStatus: string;
  Dep1: string;
  Dep2: string;
  Dep3: string;
  Dep4: string;
  Relation1: string;
  Relation2: string;
  Relation3: string;
  Relation4: string;
  ContactName: string;
  ContactAddress: string;
  ContactNumber: string;
  ContactRelation: string;
  CompanyBranch: string;
  DepartmentID: number;
  CompanyDepartment: string;
  PositionID: number;
  CompanyPosition: string;
  Shift: string;
  EmployeeStatus: string;
  RateType: string;
  DateHired: string;
  DateResign: string;
  DateProby: string;
  DateRegular: string;
  VacationLeave: string;
  SickLeave: string;
  Taxtable: string;
  Taxcode: string;
  SSS: string;
  Philhealth: string;
  HDMF: string;
  Pagibig: string;
  TIN: string;
  ATMAccount: string;
  MonthlyRate: number;
  DailyRate: number;
  HourlyRate: number;
  ModeratorFee: number;
  OccuAllowance: number;
  HomeAllowance: number;
  RiceSubsidy: number;
  MealAllowance: number;
  Allowance: number;
  Overload: number;
  Cola: number;
  Deminimis: number;
  TaxOT: number;
  Classification: string;
  AccountStatus: string;
  DateAdded: string;
  WSSSCont: number;
  WPhilhealthCont: number;
  WHDMFCont: number;
  WPagibigCont: number;
  WTaxCont: number;
  TimeLog: string;
  Teaching: string;
  PRC: string;
  PRCExpiration: string;
  SalaryScaleStep: string;
  Email: string;
  FlexiHrs: string;
  SecondContactNo: string;
  BasicPay: number;
  NDPay: string;
}

export type EmployeesResponse = Prettify<APIResponse<EmployeeData[]>>;

export interface ExpensesRecordData {
  CompanyID: string;
  PurchaseID: number;
  InvoiceNumber: string;
  PaymentType: string;
  PONo: string;
  InvoiceDate: string;
  BankName: string | null;
  CheckNumber: string | null;
  CheckDate: string | null;
  SupplierID: string;
  SupplierName: string;
  SupplierTIN: string;
  SupplierAddress: string;
  BranchID: string;
  BranchName: string;
  BranchAddress: string;
  BranchTIN: string;
  Currency: string;
  Rate: number;
  AddedBy: string | null;
  StatusID: number;
  Status: string;
  TotalCR: number;
  TotalDR: number;
  items: [
    {
      ID: number;
      PurchaseID: number;
      PONo: string;
      Particulars: string;
      item_pricelist_id: null;
      GSC: null;
      ChartAccountID: number;
      Quantity: number;
      Cost: number;
      Amount: number;
      TotalCR: number;
      TotalDR: number;
      TotalStatus: string;
      WTax: null;
      InputVat: null;
      WTaxPayment: null;
      DepartmentOffice: null;
      Exempt: null;
      ZeroRated: null;
      GovtSales: null;
      ATC: null;
      TaxType: string;
      vatable_sales: null;
    },
  ];
}

export type ExpensesRecordsResponse = Prettify<APIResponse<ExpensesRecordData[]>>;
