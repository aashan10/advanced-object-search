
pimcore.registerNS("pimcore.plugin.esbackendsearch.searchConfig.fieldConditionPanel.fieldcollections");
pimcore.plugin.esbackendsearch.searchConfig.fieldConditionPanel.fieldcollections = Class.create(pimcore.plugin.esbackendsearch.searchConfig.fieldConditionPanel.default, {

    inheritanceField: null,

    getConditionPanel: function() {

        this.subPanel = Ext.create('Ext.panel.Panel', {});

        var typeStore =  Ext.create('Ext.data.ArrayStore', {
            fields: ['key'],
            data: this.fieldSelectionInformation.context.allowedTypes
        });

        this.typeField = Ext.create('Ext.form.ComboBox',
            {
                fieldLabel: t("plugin_esbackendsearch_type"),
                store: typeStore,
                queryMode: 'local',
                width: 300,
                forceSelection: true,
                valueField: 'key',
                displayField: 'key',
                listeners: {
                    change: function( item, newValue, oldValue, eOpts ) {

                        this.subPanel.removeAll();
                        this.subPanel.add(this.buildFieldSelection(newValue));
                        pimcore.layout.refresh();

                    }.bind(this)
                }
            }
        );

        if(this.data.filterEntryData) {
            if(this.data.filterEntryData.id) {
                this.typeField.setValue("object");
            } else {
                this.typeField.setValue("object_filter");
            }
        }

        this.fieldConditionPanel = Ext.create('Ext.panel.Panel', {
            flex: 1
        });

        return Ext.create('Ext.panel.Panel', {
            items: [
                {
                    xtype: 'panel',
                    layout: 'hbox',
                    style: "padding-bottom: 10px",
                    items: [
                        this.typeField
                    ]
                },
                this.subPanel,
                this.fieldConditionPanel
            ]
        });
    },


    buildFieldSelection: function(fieldCollectionType) {

        var data = {};

        var fieldStore = new Ext.data.JsonStore({
            autoDestroy: true,
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: '/plugin/ESBackendSearch/admin/get-fields',
                reader: {
                    rootProperty: 'data',
                    idProperty: 'fieldName'
                },
                extraParams: { key: fieldCollectionType, type: 'fieldcollection' }
            },
            fields: ['fieldName','fieldLabel', 'fieldType', 'context'],
            listeners: {
                load: function (store) {
                    //TODO set values on load
                    // if(data.fieldname) {
                    //
                    //     if(data.fieldname == "localizedfields") {
                    //         //need to get real fieldname of localized fields
                    //         var language = Object.keys(data.filterEntryData)[0];
                    //         if(language) {
                    //             var fieldname = data.filterEntryData[language][0].fieldname;
                    //             if(fieldname) {
                    //                 this.fieldSelection.setValue(fieldname);
                    //             }
                    //         }
                    //
                    //     } else {
                    //         this.fieldSelection.setValue(data.fieldname);
                    //     }
                    //
                    // }
                }.bind(this)
            }
        });

        this.fieldSelection = Ext.create('Ext.form.ComboBox',
            {

                fieldLabel: t("plugin_esbackendsearch_field"),
                name: "condition",
                store: fieldStore,
                queryMode: 'local',
                width: 400,
                valueField: 'fieldName',
                displayField: 'fieldLabel',
                listeners: {
                    change: function( item, newValue, oldValue, eOpts ) {
                        var record = item.getStore().findRecord('fieldName', newValue);
                        if(record) {
                            var fieldSelectionInformation = record.data;

                            this.fieldConditionPanel.removeAll();
                            if(pimcore.plugin.esbackendsearch.searchConfig.fieldConditionPanel[fieldSelectionInformation.fieldType]) {
                                this.fieldCondition = new pimcore.plugin.esbackendsearch.searchConfig.fieldConditionPanel[fieldSelectionInformation.fieldType](fieldSelectionInformation, data);
                                this.fieldConditionPanel.add(this.fieldCondition.getConditionPanel());
                            } else {
                                console.log("ERROR - no implementation for field condition panel for " + fieldSelectionInformation.fieldType);
                            }

                            //after first change, reset data
                            data = {};
                        }

                    }.bind(this)
                }
            }
        );

        return this.fieldSelection;
    },




    getFilterValues: function() {

        var subValue = {};

        if(this.fieldCondition) {
            subValue.type = this.typeField.getValue();
            subValue.filterCondition = this.fieldCondition.getFilterValues();
        }

        return {
            fieldname: this.fieldSelectionInformation.fieldName,
            filterEntryData: subValue
        };
    }


});