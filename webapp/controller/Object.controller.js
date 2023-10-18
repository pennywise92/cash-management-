sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter"
], function (BaseController, JSONModel, History, formatter) {
    "use strict";

    return BaseController.extend("cashmanagementinwi.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                    busy : true,
                    delay : 0
                });
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "objectView");
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
            
                    Blocker: function(oEvent) {
                        var oModel = this.getOwnerComponent().getModel();
                        var oItem = this.getView().byId("table").getSelectedItem();
                        
                        if (!oItem) {
                          console.log("No item selected");
                          return;
                        }
                        
                        var oEntry = oItem.getBindingContext().getObject();
                        var Societe = oEntry.Societe;
                        var Exercice = oEntry.Exercice;
                        var NP = oEntry.NumeroDePiece;
                        
                        oModel.read("/ZbloquerSet(Societe='" + Societe + "',Exercice='" + Exercice + "',NumeroDePiece='" + NP + "')", {
                          success: function(odata, response) {
                            alert("Piece blocked successfully");
                            console.log("Piece blocked");
                          },
                          error: function(error) {
                            alert("Failed to block the piece. Please try again.");
                            console.log("Piece not blocked. Try again.");
                          }
                        });
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
        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */
        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched : function (oEvent) {
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this._bindView("/ZTAB_CASH_MANAGSet" + sObjectId);
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView : function (sObjectPath) {
            var oViewModel = this.getModel("objectView");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange : function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.NumeroDePiece,
                sObjectName = oObject.ZTAB_CASH_MANAGSet;

                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/shareSendEmailSubject",
                    oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
                oViewModel.setProperty("/shareSendEmailMessage",
                    oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }
    });

});
