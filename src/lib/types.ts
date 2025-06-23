/* eslint-disable max-lines -- will separate into multiple files later */

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
  id: number;

  /** Name of the branch. */
  branch: string;
}

/** Structure of the data returned in a successful login response. */
export interface LoginData {
  /** Authentication token for the logged-in user. */
  token: string;

  /** Details of the authenticated user. */
  user: {
    /** Unique identifier of the user. */
    id: number;

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
        read: number | null;

        /** Write permission for the module. */
        write: number | null;

        /** Edit permission for the module. */
        edit: number | null;

        /** Delete permission for the module. */
        delete: number | null;
      },
    ];

    /** List of branches the user has access to. */
    branches: Branch[];
  };
}

/** API response for a successful login attempt. */
export type LoginResponse = Prettify<APIResponse<LoginData>>;

/** API response for a successful forgot password attempt. */
export type ForgotPasswordResponse = Prettify<APIResponse<string>>;

export interface DeliveryRecordData {
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
  payment_type_id: number;
  payment_type: string;
  remarks: string;
  status_id: number;
  status: string;
  count: number;
  total_amount: number;
}

/** Represents a single delivery record in a list. */
export interface DeliveryData {
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

/** API response for a successful delivery list request. */
export type DeliveriesResponse = Prettify<APIResponse<DeliveryData[]>>;

/** API request to add a delivery item. */
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

/** API response for a successful delivery record. */
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

/** API response for a single delivery record. */
export type DeliveryRecordResponse = Prettify<APIResponse<DeliveryRecord>>;

/** Represents a single item. */
export interface Item {
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
}

/** API response for a list of items. */
export type ItemsResponse = Prettify<APIResponse<Item[]>>;

/** Represents data for a daily count. */
export interface DailyCountData {
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
}

/** API response for daily count data. */
export type DailyCountResponse = Prettify<APIResponse<DailyCountData>>;

/** Represents a single category. */
export interface Category {
  id: number;
  raw_material_type: string;
}

/** API response for a list of categories. */
export type CategoriesResponse = Prettify<APIResponse<Category[]>>;

/** Represents a single ingredient. */
export interface Ingredient {
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
  days_stock: null;
  ChartAccountID: null;
}

/** API response for a list of ingredients. */
export type IngredientsResponse = Prettify<APIResponse<Ingredient[]>>;

/** API response for a successful daily count record attempt. */
export interface DailyCountRecord {
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
}

/** API response for a single daily count record. */
export type DailyCountRecordResponse = Prettify<APIResponse<DailyCountRecord>>;

/** API response for a successful waste attempt. */
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

/** API response for waste data. */
export type WasteResponse = Prettify<APIResponse<WasteData[]>>;

/** API response for a successful waste record attempt. */
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
    barcode: string | null;
    item: string | null;
    unit: string | null;
    waste: number;
    reason: string;
    employee: string;
  }>;
}

/** API response for waste record data. */
export type WasteRecordResponse = Prettify<APIResponse<WasteRecordData>>;

/** API response for a successful employee attempt. */
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

/** API response for a list of employees. */
export type EmployeesResponse = Prettify<APIResponse<EmployeeData[]>>;

/** API response for a successful expenses record attempt. */
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
  items: Array<{
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
    Unit: string | null;
  }>;
}

/** API response for a list of expense records. */
export type ExpensesRecordsResponse = Prettify<APIResponse<ExpensesRecordData[]>>;

/** Represents a single reason for waste. */
export interface Reason {
  id: number;
  reason: string;
}

/** API response for a list of reasons. */
export type ReasonsResponse = Prettify<APIResponse<Reason[]>>;

/** Represents a single employee for waste records. */
export interface WasteEmployee {
  EmployeeID: string;
  FullName: string;
}

/** API response for a list of employees for waste records. */
export type WasteEmployeesResponse = Prettify<APIResponse<WasteEmployee[]>>;

/** Represents a single item for waste records. */
export interface WasteItem {
  id: number;
  item: string;
  barcode: string;
  unit: string;
}

/** API response for a list of items for waste records. */
export type WasteItemsResponse = Prettify<APIResponse<WasteItem[]>>;
