/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Commercial License (PCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 *  @license    http://www.pimcore.org/license     GPLv3 and PCL
 */


pimcore.registerNS("pimcore.bundle.advancedObjectSearch.searchConfig.fieldConditionPanel.table");
pimcore.bundle.advancedObjectSearch.searchConfig.fieldConditionPanel.table = Class.create({

    fieldSelectionInformation: null,
    data: {},
    termField: null,
    columnField: null,
    operatorField: null,
    inheritanceField: null,
    classId: null,

    initialize: function (fieldSelectionInformation, data, classId) {
        this.fieldSelectionInformation = fieldSelectionInformation;
        this.classId = classId;
        if (data) {
            this.data = data;
        }
    },

    getConditionPanel: function () {
        this.termField = Ext.create('Ext.form.field.Text',
            {
                fieldLabel: t("bundle_advancedObjectSearch_term"),
                width: 400,
                value: this.data.filterEntryData
            }
        );

        this.inheritanceField = Ext.create('Ext.form.field.Checkbox',
            {
                fieldLabel: t("bundle_advancedObjectSearch_ignoreInheritance"),
                value: this.data.ignoreInheritance,
                hidden: !this.fieldSelectionInformation.context.classInheritanceEnabled
            }
        );

        var termPanel = Ext.create('Ext.panel.Panel', {});
        termPanel.add(this.termField);
        termPanel.add(this.inheritanceField);

        var items = [];

        if (this.fieldSelectionInformation.context.columnConfigActivated) {
            items.push({
                xtype: 'panel',
                layout: 'hbox',
                style: "padding-bottom: 10px",
                items: [
                    this.getColumnCombobox(this.data.column),
                ]
            });
        }

        items.push({
            xtype: 'panel',
            layout: 'hbox',
            style: "padding-bottom: 10px",
            items: [
                this.getOperatorCombobox(this.data.operator)
            ]
        });
        items.push({
            xtype: 'panel',
            layout: 'hbox',
            style: "padding-bottom: 10px",
            items: [
                this.termField,
                this.inheritanceField
            ]
        });

        return Ext.create('Ext.panel.Panel', {
            items: items
        });
    },

    getColumnCombobox: function (value) {
        var columnConfig = Ext.create('Ext.data.Store', {
            fields: ['fieldName', 'fieldLabel'],
            data: this.fieldSelectionInformation.context.columnConfig.map(function (column) {
                return {
                    fieldName: column.key,
                    fieldLabel: column.label
                };
            })
        });

        this.columnField = Ext.create('Ext.form.ComboBox',
            {
                fieldLabel: t("bundle_advancedsearch_table_colum_config"),
                store: columnConfig,
                value: value,
                queryMode: 'local',
                width: 300,
                valueField: 'fieldName',
                displayField: 'fieldLabel'
            }
        );

        return this.columnField;
    },

    getOperatorCombobox: function (value) {
        var operators = Ext.create('Ext.data.Store', {
            fields: ['fieldName', 'fieldLabel'],
            data: this.fieldSelectionInformation.context.operators.map(function (operator) {
                return {
                    fieldName: operator,
                    fieldLabel: t('bundle_advancedsearch_operator_' + operator)
                };
            })
        });

        this.operatorField = Ext.create('Ext.form.ComboBox',
            {
                fieldLabel: t("bundle_advancedObjectSearch_operator"),
                store: operators,
                value: value,
                queryMode: 'local',
                width: 300,
                valueField: 'fieldName',
                displayField: 'fieldLabel',
                listeners: {
                    change: function (item, newValue, oldValue, eOpts) {

                        if (this.termField) {
                            this.termField.setDisabled(newValue == "exists" || newValue == "not_exists");
                        }

                    }.bind(this)
                }
            }
        );

        return this.operatorField;
    },

    getFilterValues: function () {
        var subValue = {};
        subValue.term = this.termField.getValue();

        if (this.fieldSelectionInformation.context.columnConfigActivated) {
            subValue.column = this.columnField.getValue();
        }

        return {
            fieldname: this.fieldSelectionInformation.fieldName,
            filterEntryData: subValue,
            operator: this.operatorField.getValue(),
            ignoreInheritance: this.inheritanceField.getValue()
        };
    }


});
