const getData = require('./indicatorData')


const stackedBar = async () => {
    const data = await getData()
    const barData = []

    for (var i in data) {
        // Does it need illegal value like null check here?
        const year = data[i].year
        const days = (year % 4 == 0 && year % 100 != 0) ? 366 : 365
        const mae = data[i].hh_size_mae
        const rate = data[i].currency_conversion_lcu_to_ppp
        var isValid = true
        if (!year || !days || !mae || !rate) {
            //console.log('Invalid record, id_uique: ' + data[i].id_unique)
            //console.log('year: ' + year + ' mae:' + mae + ' rate: ' + rate)
            continue
        }

        // for (prop in data[i]) {
        //     if(prop === 'id_unique') continue
        //     console.log('prop:' + prop)
        //     console.log('data[i][prop]' + data[i][prop])
        //     if (isNaN(data[i][prop]) || data[i][prop] === null) data[i][prop] = 0
        // }

        const i_crop = data[i].crop_income_lcu_per_year
        const i_lstk = data[i].livestock_income_lcu_per_year
        const i_o_f = data[i].off_farm_income_lcu_per_year
        const c_crop = data[i].value_crop_consumed_lcu_per_hh_per_year
        const c_lstk = data[i].value_livestock_products_consumed_lcu_per_hh_per_year


        const doc = {
            id_unique: data[i].id_unique,
            income_crop_ppp_per_mae_per_d: i_crop / rate / mae / days,
            income_lstk_ppp_per_mae_per_d: i_lstk / rate / mae / days,
            income_off_farm_ppp_per_mae_per_d: i_o_f / rate / mae / days,
            consumed_crop_ppp_per_mae_per_d: c_crop / rate / mae / days,
            consumed_lstk_ppp_per_mae_per_d: c_lstk / rate / mae / days,
        }
        doc.tva_ppp_per_mae_per_d =
            doc.income_crop_ppp_per_mae_per_d
            + doc.income_lstk_ppp_per_mae_per_d
            + doc.income_off_farm_ppp_per_mae_per_d
            + doc.consumed_crop_ppp_per_mae_per_d
            + doc.consumed_lstk_ppp_per_mae_per_d

        barData.push(doc)

    }
    return barData
}

const pie = async () => {
    const data = await getData()
    const counter = {
        under_1_usd_cnt: 0,
        _1to1_9_cnt: 0,
        above_1_9_cnt: 0,
    }


    for (var i in data) {
        // Does it need illegal value like null check here?
        const year = data[i].year
        const days = (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) ? 366 : 365
        const mae = data[i].hh_size_mae
        const rate = data[i].currency_conversion_lcu_to_ppp
        if (!year || !days || !mae || !rate) {
            console.log('Invalid record, id_uique: ' + data[i].id_unique)
            console.log('year: ' + year + ' mae:' + mae + ' rate: ' + rate)
            continue
        }
        const doc = {
            id_unique: data[i].id_unique,
            total_income_ppp_per_mae_per_d: data[i].total_income_lcu_per_year / rate / mae / days,
        }
        if (doc.total_income_ppp_per_mae_per_d < 1) {
            counter.under_1_usd_cnt++
        }
        else if (doc.total_income_ppp_per_mae_per_d > 1.9) {
            counter.above_1_9_cnt++
        }
        else {
            counter._1to1_9_cnt++
        }
    }

    const cnt = [
        { value: counter.under_1_usd_cnt, name: '< 1 USD' },
        { value: counter._1to1_9_cnt, name: '1 to 1.99 USD' },
        { value: counter.above_1_9_cnt, name: '> 1.99 USD' },
    ]
    return cnt
}

const boxWhisker = async () => {
    const data = await getData()
    const boxData = {
        income_crop_ppp_per_mae: [],
        income_lstk_ppp_per_mae: [],
        income_off_farm_ppp_per_mae: [],
        consumed_crop_ppp_per_mae: [],
        consumed_lstk_ppp_per_mae: [],
    }

    for (var i in data) {
        // Does it need illegal value like null check here?
        const mae = data[i].hh_size_mae
        const rate = data[i].currency_conversion_lcu_to_ppp
        if (!mae || !rate) {
            console.log('Invalid record, id_uique: ' + data[i].id_unique)
            console.log(' mae:' + mae + ' rate: ' + rate)
            continue
        }
        boxData.income_crop_ppp_per_mae.push(data[i].crop_income_lcu_per_year / rate / mae)
        boxData.income_lstk_ppp_per_mae.push(data[i].livestock_income_lcu_per_year / rate / mae)
        boxData.income_off_farm_ppp_per_mae.push(data[i].off_farm_income_lcu_per_year / rate / mae)
        boxData.consumed_crop_ppp_per_mae.push(data[i].value_crop_consumed_lcu_per_hh_per_year / rate / mae)
        boxData.consumed_lstk_ppp_per_mae.push(data[i].value_livestock_products_consumed_lcu_per_hh_per_year / rate / mae)
    }
    return boxData
}

module.exports = { stackedBar, boxWhisker, pie }