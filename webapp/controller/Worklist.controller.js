sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("cashmanagementinwi.controller.Worklist", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
         
           // Obtenir les vues relatives
            const oSmartTableFilter = this.getView().byId("smartFilterBar");
            const that = this

                 
                // Attach the "search" event to the smarttablefilter's "search" event
                oSmartTableFilter.attachSearch(function () {
                    that.getView().byId("_IDGenBusyDialog1").open()
                    // Get the value of the SalesOrder filter input
                    var sSoci = oSmartTableFilter.getFilterData().Societe;
                    console.log(sSoci);
                    var sExe = oSmartTableFilter.getFilterData().Exercice;
                    console.log(sExe);
                    var sNp = oSmartTableFilter.getFilterData().NumeroDePiece;
                    console.log(sNp);
                    var sFo = oSmartTableFilter.getFilterData().Fournisseur;
                    console.log(sFo);
                    
                    var sBp = oSmartTableFilter.getFilterData().BlocagePaiment;
                    console.log(sBp);
                 

                    


                    // Create a filter 
                    var oFilterSOCI = new Filter("Societe", FilterOperator.EQ, sSoci);
                    let filterArray = []
                    if (sExe.ranges[0].operation=="EQ") {
                        console.log(sExe.ranges[0].value1)
                        var oFilterEx = new Filter("Exercice", FilterOperator.EQ, sExe.ranges[0].value1);
                        filterArray.push(oFilterEx)
                    } else {
                        var oFilterEx1 = new Filter("Exercice", FilterOperator.GE, sExe.ranges[0].value1);
                        var oFilterEx2 = new Filter("Exercice", FilterOperator.LE, sExe.ranges[0].value2);
                    filterArray.push(oFilterEx1)
                    filterArray.push(oFilterEx2)
                    }

                    if (sNp){
                        
                        if (sNp.ranges[0].operation=="EQ") {
                            var oFilterNp = new Filter("NumeroDePiece", FilterOperator.EQ, sNp.ranges[0].value1 );
                            filterArray.push(oFilterNp)
                        } else {
                            var oFilterNp1 = new Filter("NumeroDePiece", FilterOperator.GE, sNp.ranges[0].value1);
                            var oFilterNp2 = new Filter("NumeroDePiece", FilterOperator.LE, sNp.ranges[0].value2);
                            filterArray.push(oFilterNp1)
                            filterArray.push(oFilterNp2)
                        }
                    }

                    if (sFo){
                        var oFilterFo = new Filter("Fournisseur", FilterOperator.EQ, sFo);
                        filterArray.push(oFilterFo)
                    }

                    
                    if (sBp){
                        var oFilterBp = new Filter("BlocagePaiment", FilterOperator.EQ, sBp);
                        filterArray.push(oFilterBp)
                    }

                   

                    filterArray.push(oFilterSOCI)

                    /*filterArray.push(oFilterInterval);*/

                    var oTable = that.byId("table")
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter(filterArray);

                    console.log(filterArray);
                    console.log(that.getOwnerComponent().getModel());
                  

                })

            var oViewModel;

            // keeps the search state
            this._aTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

        },


       

       
        onUpdateFinished : function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress : function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack : function() {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },


        onSearch : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("NumeroDePiece", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },

     

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh : function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject : function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/ZTAB_CASH_MANAGSet".length)
            });
        },

        

        
        Telecharger: function(oEvent) { 

var id = oEvent.getSource().sId.substring("application-cashmanagementinwi-display-component---worklist--".length);
var oItem = this.getView().byId("table").getSelectedItem();
var oEntry = oItem.getBindingContext().getObject();

console.log(oEntry);

var Societe = oEntry.Societe;
var Exercice = oEntry.Exercice;
var NP = oEntry.NumeroDePiece;
var Telecharger = id;
var sSource = "http://10.104.12.91:8000/sap/opu/odata/SAP/ZGW_CASH_MANAGEMENT_SRV/STREAMSet(Societe='"+Societe+"',Exercice="+parseInt(Exercice)+",NumeroDePiece='"+NP+"',Button='"+Telecharger+"')/$value";
var w = window.open(sSource,'_parent','download');

if(w == null){
alert('ERROR IN OPENING DOCUMENT')
}



        },

       

        Afficher: function(oEvent) { 
            var id = oEvent.getSource().sId.substring("application-cashmanagementinwi-display-component---worklist--".length)
            var oItem= this.getView().byId("table").getSelectedItem();
            var oEntry = oItem.getBindingContext().getObject();
            console.log(oEntry);
           var Societe=oEntry.Societe;
           var Exercice=oEntry.Exercice;
           var NP=oEntry.NumeroDePiece;
           var Afficher = id;

           var sSource = "http://10.104.12.91:8000/sap/opu/odata/SAP/ZGW_CASH_MANAGEMENT_SRV/STREAMSet(Societe='"+Societe+"',Exercice="+parseInt(Exercice)+",NumeroDePiece='"+NP+"',Button='"+Afficher+"')/$value";
           window.open(sSource,'_blank','fullscreen=yes');

        },
        
                    Blocker: function(oEvent) { 
                        var oModel = this.getOwnerComponent().getModel();
                        var oItem= this.getView().byId("table").getSelectedItem();
                        var oEntry = oItem.getBindingContext();
                        console.log(oItem);
                        var Societe=oEntry.Societe;
                        var Exercice=oEntry.Exercice;
                        var NP=oEntry.NumeroDePiece;
                        oModel.read("/ZbloquerSet(Societe='"+Societe+"',Exercice='"+Exercice+"',NumeroDePiece='"+NP+"')" , { success :function (odata , response){
                        
                            alert("ok")
                            console.log('pj blocked');
            
                        }, error : function(error){
                            alert("not ok")
                            console.log('pj not blocked');
            
                        }
                
                    })},
            
                    
            
                    
        onPaste: function(oEvent) {
			var oResult = oEvent.getParameter("result");
			MessageToast.show("Paste result:" + JSON.stringify(oResult), {
				width: "75vw"
			});
		},

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function(aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        }

    });
});
