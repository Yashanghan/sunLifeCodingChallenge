import { LightningElement, track, wire } from "lwc";
import getAccountFinancialRecords from "@salesforce/apex/GetAccountFinancialRecords.getAccountFinancialRecords";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";

const columns = [
  {
    label: "Account Name",
    fieldName: "NameUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "Name" }, target: "_blank" },
    sortable: true,
  },
  { label: "Account Owner", fieldName: "AccountOwner" },
  { label: "Phone", fieldName: "Phone", editable: true },
  { label: "Website", fieldName: "Website", editable: true },
  { label: "Annual Revenue", fieldName: "AnnualRevenue", editable: true },
];

export default class CustomComponent extends LightningElement {
  data = [];
  fldsItemValues = [];
  @track searchText = "";

  @wire(getAccountFinancialRecords, { searchText: "" })
  wiredAccounts({ data, error }) {
    if (data) {
      this.mapFields(data);
    } else {
      this.data = undefined;
      this.error = error;
    }
  }
  columns = columns;
  defaultSortDirection = "asc";
  sortDirection = "asc";
  sortedBy;

  mapFields(data) {
    data = data.map((row) => {
      return { ...row, AccountOwner: row.Owner.Name, NameUrl: "/" + row.Id };
    });
    this.data = data;
    this.error = undefined;
  }
  
  sortBy(field, reverse, primer) {
    const key = primer
      ? function (x) {
          return primer(x[field]);
        }
      : function (x) {
          return x[field];
        };

    return function (a, b) {
      a = key(a);
      b = key(b);
      return reverse * ((a > b) - (b > a));
    };
  }

  handleFilterChange(event) {
    this.searchText = event.target.value;

    getAccountFinancialRecords({ searchText: this.searchText })
      .then((result) => {
        if (result) {
          this.mapFields(result);
        }
      })
      .catch((error) => {});
  }

  onHandleSort(event) {
    const { fieldName: sortedBy, sortDirection } = event.detail;
    const cloneData = [...this.data];

    cloneData.sort(this.sortBy(sortedBy, sortDirection === "asc" ? 1 : -1));
    this.data = cloneData;
    this.sortDirection = sortDirection;
    this.sortedBy = sortedBy;
  }

  handleChange(event) {}
  saveHandleAction(event) {
    this.fldsItemValues = event.detail.draftValues;
    const inputsItems = this.fldsItemValues.slice().map((draft) => {
      const fields = Object.assign({}, draft);
      return { fields };
    });

    const promises = inputsItems.map((recordInput) =>
      updateRecord(recordInput)
    );
    Promise.all(promises)
      .then((res) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Records Updated Successfully!!",
            variant: "success",
          })
        );
        this.fldsItemValues = [];
        return this.refresh();
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error",
            message: "An Error Occured!!",
            variant: "error",
          })
        );
      })
      .finally(() => {
        this.fldsItemValues = [];
      });
  }

  async refresh() {
    await refreshApex(this.data);
  }
}
