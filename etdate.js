/*
This provides functions to convert dates from Gregorian calendar to Ethiopian calendar and vice versa.
It is guaranteed to be correct between the gregorian years 1904 and 2099.
*/

// new years after leap years
const NEW_LEAP_YR_ET = new Date(2019, 8, 12)
const NEW_LEAP_YR = new Date(2021, 0, 1)
const NEW_LEAP_START_YR_ET = 2012
const YR_DIFF_AT_LEAP_START = NEW_LEAP_YR_ET.getFullYear() - NEW_LEAP_START_YR_ET

const dayMS = 24 * 3600 * 1000
const LEAP_DIFF_DAYS = (NEW_LEAP_YR - NEW_LEAP_YR_ET) / dayMS

const NORMAL_YR_DAYS = 365
const MONTH_DAYS_ET = 30
const LEAP_YEARS = 4

const months = ['መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን']

function etdate(gdate) {  // gdate is Date()
    // get last leap year start
    const lastLeapYr = Math.floor(gdate.getFullYear() / LEAP_YEARS) * LEAP_YEARS
    const lastLeapStart = new Date(lastLeapYr + 1, NEW_LEAP_YR.getMonth(), NEW_LEAP_YR.getDate())
    // get days since last leap year
    const daysSinceLeapStart = Math.floor((gdate - lastLeapStart) / dayMS)
    // get last eth leap year start
    const lastLeapStartEt = new Date(lastLeapStart - new Date(LEAP_DIFF_DAYS * dayMS))
    // get days since last eth leap year start
    const lastLeapStartYrEt = lastLeapStartEt.getFullYear() - YR_DIFF_AT_LEAP_START
    const daysSinceLeapStartEt = daysSinceLeapStart + LEAP_DIFF_DAYS
    // organize into year, month, day
    const yrsSinceLeapStartEt = Math.floor(daysSinceLeapStartEt / NORMAL_YR_DAYS)
    const eyear = lastLeapStartYrEt + yrsSinceLeapStartEt
    let daysSinceYrStartEt = daysSinceLeapStartEt % NORMAL_YR_DAYS
    if (yrsSinceLeapStartEt === LEAP_YEARS) {
        if (daysSinceYrStartEt === 0) {
            // last day of eth leap year, pagume 6
            return [eyear - 1, 13, 6]
        }
        if (lastLeapYr < gdate.getFullYear()) {
            // compensate for pagume 6 coming ahead of dec 31
            daysSinceYrStartEt--
        }
    }
    const monthsSinceLastYrEt = Math.floor(daysSinceYrStartEt / MONTH_DAYS_ET)
    const daysSinceLastMonthEt = daysSinceYrStartEt % MONTH_DAYS_ET
    const emonth = monthsSinceLastYrEt + 1
    const eday = daysSinceLastMonthEt + 1
    return [eyear, emonth, eday]
}

function fromEtdate(yearEt, monthEt, dayEt) {
    // get last eth leap start
    const lastLeapStartYrEt = Math.floor(yearEt / LEAP_YEARS) * LEAP_YEARS
    const lastLeapStartEt = new Date(lastLeapStartYrEt + YR_DIFF_AT_LEAP_START, NEW_LEAP_YR_ET.getMonth(), NEW_LEAP_YR_ET.getDate())
    // get days since last eth leap year
    const yrsSinceLeapStartEt = yearEt - lastLeapStartYrEt
    const daysSinceLeapStartEt = yrsSinceLeapStartEt * NORMAL_YR_DAYS + (monthEt - 1) * MONTH_DAYS_ET + dayEt - 1
    // get date since last leap start
    return new Date(lastLeapStartEt.getTime() + daysSinceLeapStartEt * dayMS)
}
