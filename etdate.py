'''
module etdate
provides functions to convert dates from Gregorian to Ethiopian calendar and vice versa.
It works from Gregorian years 0004 to 9999.
It follows the rules of the Gregorian calendar on leap years for conversion to the Ethiopian calendar.
'''

from datetime import date, timedelta

# new years after leap years
NEW_LEAP_YR_ET = date(2019, 9, 12)
NEW_LEAP_YR = date(2021, 1, 1)

NEW_LEAP_START_YR_ET = 2012
YR_DIFF_AT_LEAP_START = NEW_LEAP_YR_ET.year - NEW_LEAP_START_YR_ET

LEAP_DIFF_DAYS = (NEW_LEAP_YR - NEW_LEAP_YR_ET).days

NORMAL_YR_DAYS = 365
MONTH_DAYS_ET = 30
LEAP_YEARS = 4

months = ['መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን']

def etdate(gdate: date):
    if gdate.year < 4:
        raise OverflowError('Minimum Gregorian year to convert is 0004.')
    # get last leap year start
    last_leap_yr = gdate.year // LEAP_YEARS * LEAP_YEARS
    last_leap_start = date(last_leap_yr + 1, NEW_LEAP_YR.month, NEW_LEAP_YR.day)
    # get days since last leap year
    days_since_leap_start = (gdate - last_leap_start).days
    # get last eth leap year start
    last_leap_start_et = last_leap_start - timedelta(days=LEAP_DIFF_DAYS)
    # get days since last eth leap year start
    last_leap_start_yr_et = last_leap_start_et.year - YR_DIFF_AT_LEAP_START
    days_since_leap_start_et = days_since_leap_start + LEAP_DIFF_DAYS
    # organize into year, month, day
    yrs_since_leap_start_et = days_since_leap_start_et // NORMAL_YR_DAYS
    days_since_yr_start_et = days_since_leap_start_et % NORMAL_YR_DAYS
    # (gregorian rule, www.cs.usfca.edu/~cruse/cs210s05/leapyear.bob)
    last_leap_yr_not_really_leap = (last_leap_start.year - 1) % 100 == 0 and (last_leap_start.year - 1) % 400 != 0
    if yrs_since_leap_start_et == LEAP_YEARS and days_since_yr_start_et == 0 and not last_leap_yr_not_really_leap:
        # last day of eth leap year, pagume 6
        eyear = last_leap_start_yr_et + yrs_since_leap_start_et - 1
        emonth = 13
        eday = 6
        return eyear, emonth, eday
    months_since_last_yr_et = days_since_yr_start_et // MONTH_DAYS_ET
    days_since_last_month_et = days_since_yr_start_et % MONTH_DAYS_ET
    eyear = last_leap_start_yr_et + yrs_since_leap_start_et
    emonth = months_since_last_yr_et + 1
    eday = days_since_last_month_et + 1
    if eyear % LEAP_YEARS == 0 and days_since_yr_start_et < 3 * MONTH_DAYS_ET + 20 or last_leap_yr_not_really_leap:
        # compensate for feb 29
        eday -= 1
    return eyear, emonth, eday

def from_etdate(year_et: int, month_et: int, day_et: int):
    # get last eth leap start
    last_leap_start_yr_et = (year_et // LEAP_YEARS) * LEAP_YEARS
    last_leap_start_et = date(last_leap_start_yr_et + YR_DIFF_AT_LEAP_START, NEW_LEAP_YR_ET.month, NEW_LEAP_YR_ET.day)
    # get days since last eth leap year
    yrs_since_leap_start_et = year_et - last_leap_start_yr_et
    days_since_leap_start_et = yrs_since_leap_start_et * NORMAL_YR_DAYS + (month_et - 1) * MONTH_DAYS_ET + day_et - 1
    # get date since last leap start
    return last_leap_start_et + timedelta(days=days_since_leap_start_et)
