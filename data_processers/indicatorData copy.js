const lodash = require('lodash')
const data = require("../models/data")
const selectKeys = [
    "id_unique",
    "id_form",
    "id_rhomis_dataset",
    "id_proj",
    "iso_country_code",
    "year",
    "hh_size_members",
    "hh_size_mae",
    "currency_conversion_lcu_to_ppp",
    "currency_conversion_factor_year",
    "crop_income_lcu_per_year",
    "livestock_income_lcu_per_year",
    "total_income_lcu_per_year",
    "off_farm_income_lcu_per_year",
    "value_crop_consumed_lcu_per_hh_per_year",
    "value_livestock_products_consumed_lcu_per_hh_per_year",
    // "value_farm_products_consumed_lcu_per_hh_per_year",
]
const stringKeys = [
    "id_unique",
    "id_form",
    "id_rhomis_dataset",
    "id_proj",
    "iso_country_code",
]

const lcu2pppKeys = [
    "crop_income_lcu_per_year",
    "livestock_income_lcu_per_year",
    "total_income_lcu_per_year",
    "off_farm_income_lcu_per_year",
    "value_crop_consumed_lcu_per_hh_per_year",
    "value_livestock_products_consumed_lcu_per_hh_per_year",
    // "value_farm_products_consumed_lcu_per_hh_per_year",
]

const getIndicatorData = async () => {
    // Query for all dataType:'indicator_data' in data
    // Noticed that some record has null in 'id_proj' , just skip those
    // var indicators = await data.find({ dataType: 'indicator_data', 'data.id_proj': { "$ne": null } })
    var indicators = await data.find({ dataType: 'indicator_data'})
    var indicator_data = indicators.reduce((collection, doc) => {
        // flag to exclude invalid record
        var isValid = true;

        // Filter for needed keys(fields)
        var data = lodash.pick(doc.data, selectKeys)
        // Convert string into number
        let formatedData = {}
        for (const prop in data) {
            formatedData = stringKeys.includes(prop)
                ? { ...formatedData, [prop]: data[prop] }
                : { ...formatedData, [prop]: parseFloat(data[prop]) }
            if (data[prop]===null || data[prop] ==='null') {
                isValid = false
                console.log(`id_unique: ${formatedData.id_unique}, invalid \'${prop}\', value: ${data[prop]}`)
            }
        }

        if(!formatedData.hh_size_mae){
            isValid = false
            console.log(`id_unique: ${formatedData.id_unique}, invalid \'MAE\' value :${formatedData.hh_size_mae}`)
        }




        if (isValid) {
            // Calculate attributes for Livelihoods page
            // 1. Convert LCU into PPP
            // 2. Per year to per day
            // 3. Per household to per MAE
            rate = formatedData.currency_conversion_lcu_to_ppp
            for (const i in lcu2pppKeys) {
                var oldKey = lcu2pppKeys[i]
                var newKey = oldKey.replace('lcu', 'ppp').replace('per_year', 'per_day')
                if (newKey.includes('per_hh')) {
                    newKey = newKey.replace('per_hh', 'per_mae')
                }
                else {
                    newKey = newKey.replace('per_day', 'per_mae_per_day')
                }
                const year = formatedData.year
                const days = (year % 4 == 0 && year % 100 != 0) ? 366 : 365
                const mae = formatedData.hh_size_mae
                var oldValue = formatedData[oldKey]
                formatedData[newKey] = oldValue / rate / days / mae
                delete formatedData[oldKey]
            }
            collection.push(formatedData)
        }
        return collection
    }, [])
    console.log(`Found ${indicator_data.length} records`)
    return indicator_data
}

module.exports = getIndicatorData