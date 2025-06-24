import type { DeliveryItem } from "./delivery";
import type { APIResponse, Prettify } from "./utils";

/** Represents an expenses record used in a table. */
export interface ExpensesTableData {
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
}

/** Represents an expenses record used in a form. */
export type ExpensesRecordFormData = ExpensesTableData & {
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
};

/** Represents an expense item. */
export type ExpensesItemData = DeliveryItem;

/** Represents the API response for a list of expenses records. */
export type ExpensesRecordListResponse = Prettify<APIResponse<ExpensesTableData[]>>;

/** Represents the API response for a single expenses record by ID, used in a form. */
export type ExpensesRecordResponse = Prettify<APIResponse<ExpensesRecordFormData[]>>;

/** Represents the API response for a list of expenses items. */
export type ExpensesItemListResponse = Prettify<APIResponse<ExpensesItemData[]>>;
