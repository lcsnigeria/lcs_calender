/**
 * lcsCalendar JavaScript Library
 * 
 * Description:
 * This JavaScript library provides a customizable, feature-rich calendar component designed to display dates over a range from 
 * 100 years ago to 10 years into the future. The library supports two primary purposes: 
 * 1. "showcase" mode - ideal for displaying a static calendar, and 
 * 2. "input" mode - enabling users to select dates, with callback support for custom actions.
 * 
 * Key Features:
 * - **Dynamic Date Range**: Displays dates over a range of 110 years, allowing navigation through past, current, and future dates.
 * - **Expandable and Compact Views**: Supports a flexible view where users can toggle between an expanded (12-month) and compact (1-month) display.
 * - **Intelligent Date Handling**: Calculates the number of days in each month, taking leap years into account.
 * - **Ordinal Indicators**: Adds appropriate suffixes (st, nd, rd, th) to dates.
 * - **Input Mode with Callback Support**: In input mode, users can select a date, and the library triggers a specified callback function.
 * - **Responsive Navigation**: Provides year and month navigation, with arrow icons for easy scrolling.
 * - **Custom SVG Icons**: Includes SVG icon generators for expand, shrink, and navigation icons.
 * - **Modular Design**: Structured as a JavaScript class, `lcsCalendar`, making it easy to instantiate and integrate into various projects.
 * 
 * Helper Functions:
 * - Utility functions to validate dates, convert strings to booleans, extract substrings, and manage ordinal indicators.
 * - `scrollElementTo` for directional scrolling within year navigation.
 * - SVG generators for creating icons within the calendar UI.
 * 
 * Usage:
 * To use the calendar, instantiate the `lcsCalendar` class with the desired configuration options:
 * - `year`, `month`: Define the initial display date.
 * - `yearStart`, `yearEnd`: Limit the selectable year range.
 * - `purpose`: Set to "showcase" for a static calendar, or "input" for date selection.
 * - `flexible`, `expanded`: Enable expand/shrink functionality and set the initial view.
 * - `conclusionCallback`: Define a callback function for handling selected dates in input mode.
 * 
 * Example:
 * const calendar = new lcsCalendar({
 *     year: 2024,
 *     month: 10,
 *     yearStart: 1920,
 *     yearEnd: 2034,
 *     purpose: 'input',
 *     flexible: true,
 *     expanded: false,
 *     conclusionCallback: 'handleDateSelection'
 * });
 * 
 * This will create a calendar starting in 1920 and ending in 2034, with input mode enabled and flexible view toggling.
 * The conclusionCallback is called after user selects year, month and then date;
 * 
 * Author: Chinonso F. Justice (@jcfuniverse)
 * Date: November 2024
 */




// Initialize Date
const getDate = new Date();

// Initialize year
const currentYear = getDate.getFullYear();
const previousYear = currentYear - 1;
const nextYear = currentYear + 1;
const oldestYear = currentYear - 100;
const newestYear = currentYear + 10;

// Initialize month
const currentMonthByIndex = getDate.getMonth(); // Jan/0 to Dec/11
const currentMonth = currentMonthByIndex + 1; // Jan/1 to Dec/12

// Initialize date number
const currentDate = getDate.getDate(); // 1 to 28/29/30/31

// Initialize day
const currentDayByIndex = getDate.getDay(); // Sun/0 to Sat/6
const currentDay = currentDayByIndex + 1; // Sun/1 to Sat/7

/**
 * Set up list of months from Jan/0 to Dec/11
 */
const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

/**
 * Set up list of days from Sunday/0 to Saturday/6
 */
const dayNames = [
    "Sunday", "Monday", "Tuesday", 
    "Wednesday", "Thursday", "Friday", 
    "Saturday"
];

// Number of month with 31 days and Number month with 30 days
const month31 = [1, 3, 5, 7, 8, 10, 12];
const month30 = [4, 6, 9, 11];

// Initialize Var to tell whether user is making year/month selections
let yearSelected = false, 
monthSelected = false, 
dateSelected = false, 
selectedYearValue = null, 
selectedMonthValue = null, 
selectedDateValue = null, 
selectionValue = null, 
doOnSelection = false;

/**
 * Gets the starting day of the week for the 1st of a given month and year.
 * 
 * @param {number} year - The year (must be greater than 0).
 * @param {number} month - The month (1-12).
 * @returns {number|boolean} - Returns the day of the week (1 = Sunday, 2 = Monday, etc.) if valid, or false if the input is invalid.
 */
function getDayOfMonthStart(year, month) {
    // Validate year and month
    if (year < 1 || month < 1 || month > 12) {
        console.error("Invalid year or month. Please enter valid year between 100 years ago and 10 years from now, and a month value between 1 and 12.");
        return false;
    }

    const date = new Date(year, month - 1, 1);
    return date.getDay() + 1; // Returns 1 for Sunday, 2 for Monday, etc.
}

/**
 * Returns the number of days in a given month and year.
 * 
 * @param {number} year - The year to check.
 * @param {number} month - The month to check (1-12).
 * @returns {number} - The number of days in the specified month and year.
 * @throws {Error} Will log an error and return 0 if the month is out of range (not 1-12).
 */
function getDaysCountInAMonth(year, month) {
    // Validate the month input (should be between 1 and 12)
    if (month < 1 || month > 12) {
        console.error("Invalid month. Please enter a value between 1 and 12.");
        return 0;
    }

    // Check for months with 31 days
    if (month31.includes(month)) {
        return 31;
    }

    // Check for months with 30 days
    if (month30.includes(month)) {
        return 30;
    }

    // Handle February
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    return isLeapYear ? 29 : 28;
}

/**
 * Checks if the provided date, month, and year match today's date.
 * 
 * @param {number|string} date - The day of the month to check.
 * @param {number|string} month - The month to check (1-12).
 * @param {number|string} year - The year to check.
 * @returns {boolean} - Returns true if the provided date, month, and year match today's date; otherwise, false.
 * 
 * @example
 * // Assuming today's date is October 30, 2024
 * dateOfToday(30, 10, 2024); // Returns true
 * dateOfToday(29, 10, 2024); // Returns false
 */
function dateOfToday(date, month, year) {
    date = parseInt(date, 10);
    month = parseInt(month, 10);
    year = parseInt(year, 10);

    return (year === currentYear && month === currentMonth && date === currentDate);
}

/**
 * Adds an ordinal indicator (st, nd, rd, th) to a given number.
 * 
 * @param {number|string} number - The number to which the ordinal indicator should be added.
 * @returns {string} - The number with the appropriate ordinal suffix, or an error message if input is invalid.
 */
function setOrdinalIndicators(number) {
    // Check if the input is a valid number (integer or numeric string)
    if (!/^\d+$/.test(number)) {
        return "Error: Input is not a valid number.";
    }

    // Convert number to string to easily access individual digits
    number = number.toString();

    // Get the last two digits to handle special cases like 11, 12, and 13
    const lastTwoDigits = parseInt(number.slice(-2));
    const lastDigit = parseInt(number.slice(-1));

    // Determine the suffix based on the last two digits and last digit
    let suffix;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        suffix = "th"; // Special case for 11th, 12th, 13th
    } else {
        switch (lastDigit) {
            case 1:
                suffix = "st";
                break;
            case 2:
                suffix = "nd";
                break;
            case 3:
                suffix = "rd";
                break;
            default:
                suffix = "th";
        }
    }

    return number + suffix;
}


/**
 * Extracts a substring from the specified position with a given count of characters.
 * 
 * @param {string} string - The source string to extract from.
 * @param {number} [count=1] - The number of characters to extract (default is 1).
 * @param {number} [position=0] - The starting position of the substring (default is 0).
 * @returns {string} - The extracted substring, or an empty string if the position or count is invalid.
 * @throws {Error} Will log an error if position is out of range or count is negative.
 */
function extractString(string, count = 1, position = 0) {
    // Input validation
    if (position < 0 || position >= string.length) {
        console.error("Invalid position");
        return '';
    }

    if (count < 0) {
        console.error("Invalid count");
        return '';
    }

    // Extract the substring from the given position with the specified count
    const extractedString = string.slice(position, position + count);

    return extractedString;
}

/**
 * Converts a string representation of a boolean value to an actual boolean.
 * 
 * @param {string} str - The string to convert. Accepts "true", "false", "1", or "0".
 * @returns {boolean} - Returns true if the string is "true" (case-insensitive) or "1"; otherwise, returns false.
 * 
 * @example
 * toBoolean("true");    // Returns: true
 * toBoolean("false");   // Returns: false
 * toBoolean("1");       // Returns: true
 * toBoolean("0");       // Returns: false
 */
function toBoolean(str) {
    return str.toLowerCase() === "true" || str === "1";
}

/**
 * Checks if the provided element is an input-like element that supports the `.value` property.
 * This includes `<input>`, `<textarea>`, and `<select>` elements.
 * 
 * @param {Element} element - The DOM element to check.
 * @returns {boolean} - Returns true if the element is an input, textarea, or select element; otherwise, false.
 * 
 * @example
 * // Assuming <input id="myInput"> exists in the DOM
 * const element = document.getElementById("myInput");
 * isInputElement(element); // Returns true
 * 
 * // Assuming <div id="myDiv"> exists in the DOM
 * const nonInputElement = document.getElementById("myDiv");
 * isInputElement(nonInputElement); // Returns false
 */
function isInputElement(element) {
    return (
        element instanceof HTMLInputElement || 
        element instanceof HTMLTextAreaElement || 
        element instanceof HTMLSelectElement
    );
}

/**
 * Scrolls an element in a specified direction by a specified amount.
 * 
 * @param {HTMLElement} element - The DOM element to scroll.
 * @param {string} direction - The direction to scroll ("top", "right", "bottom", or "left").
 * @param {number} scrollAmount - The number of pixels to scroll in the specified direction.
 */
function scrollElementTo(element, direction, scrollAmount) {
    switch (direction.toLowerCase()) {
        case "top":
            element.scrollBy({ top: -scrollAmount, behavior: "smooth" });
            break;
        case "right":
            element.scrollBy({ left: scrollAmount, behavior: "smooth" });
            break;
        case "bottom":
            element.scrollBy({ top: scrollAmount, behavior: "smooth" });
            break;
        case "left":
            element.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            break;
        default:
            console.warn("Invalid direction. Use 'top', 'right', 'bottom', or 'left'.");
    }
}

/**
 * Scrolls the calendar to the selected year within the calendar body.
 * 
 * This function locates an element within the calendar's main body that
 * represents the selected year (indicated by the class `calendarLOY` and
 * an attribute `data-yob`). If found, it scrolls smoothly to bring the
 * selected year into view, centered within the viewport.
 */
function scrollToSelectedYear() {
    // Get reference to the calendar main body
    const calendarHTMLBody = document.getElementById("lcsCalendar");
    if (calendarHTMLBody) {
        const selectedYear = calendarHTMLBody.querySelector(".calendarLOY[data-yob]");
        if (selectedYear) {
            selectedYear.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
    }
}

/**
 * Default callback function for handling user-selected dates within the active LCS calendar instance.
 *
 * This function checks if a year, month, and date have been selected by the user in the interactive calendar.
 * If all values are selected, it constructs a formatted date string as `selectionValue` in `DD-MM-YYYY` format.
 * Once processed, it resets all selection variables and removes the active calendar from the DOM.
 * 
 * @throws {Error} Logs an error if the user has not selected a year, month, or date, or if no active calendar is found.
 * 
 * Example usage:
 * defaultConclusionCallback(); // Assumes the user has interacted with a calendar instance
 */
function defaultConclusionCallback() {
    
    // Locate the active LCS calendar instance (if any)
    const userIntCalender = document.querySelector("#lcsCalendar.activeCalendar");
    
    if (userIntCalender) {

        // Validate year selection
        if (yearSelected !== true) {
            console.error("Please select year");
            return;
        }

        // Validate month selection
        if (monthSelected !== true) {
            console.error("Please select month");
            return;
        }

        // Validate date selection
        if (dateSelected !== true) {
            console.error("Please select date");
            return;
        }

        // Construct the selected date in 'DD-MM-YYYY' format and process
        selectionValue = `${selectedDateValue}-${selectedMonthValue}-${selectedYearValue}`;
        console.log(selectionValue);
        const inputToReceiveSelectionValue = document.querySelector(".getCalendarSelectionValue");
        if (inputToReceiveSelectionValue) {
            if (!isInputElement(inputToReceiveSelectionValue)) {
                throw new Error("The element provided to receive the Selection value must be a valid input element.");
            }
            inputToReceiveSelectionValue.value = selectionValue;
        }
        
        // Reset selection states and values for future calendar interactions
        yearSelected = false;
        monthSelected = false;
        dateSelected = false;
        selectedYearValue = null;
        selectedMonthValue = null;
        selectedDateValue = null;

        // Remove the calendar instance from the DOM
        userIntCalender.remove();
        
    } else {
        console.error("Unexpected error! No interaction with any LCS Calendar");
    }
}


/**
 * Generates an SVG icon for a "shrink" action.
 * 
 * @returns {string} - SVG markup representing the shrink icon.
 */
const shrinkIcon = () => {
    return `<svg 
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#050505"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M15 15l6 6m-6-6v4.8m0-4.8h4.8" />
        <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
        <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
        <path d="M9 4.2V9m0 0H4.2M9 9L3 3" />
    </svg>`; 
}

/**
 * Generates an SVG icon for an "expand" action.
 * 
 * @returns {string} - SVG markup representing the expand icon.
 */
const expandIcon = () => {
    return `<svg 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg">
        <path d="M4.75 9.233C4.75 9.64721 5.08579 9.983 5.5 9.983C5.91421 9.983 6.25 9.64721 6.25 9.233H4.75ZM6.25 5.5C6.25 5.08579 5.91421 4.75 5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5H6.25ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5C4.75 5.91421 5.08579 6.25 5.5 6.25V4.75ZM9.233 6.25C9.64721 6.25 9.983 5.91421 9.983 5.5C9.983 5.08579 9.64721 4.75 9.233 4.75V6.25ZM6.03033 4.96967C5.73744 4.67678 5.26256 4.67678 4.96967 4.96967C4.67678 5.26256 4.67678 5.73744 4.96967 6.03033L6.03033 4.96967ZM9.96967 11.0303C10.2626 11.3232 10.7374 11.3232 11.0303 11.0303C11.3232 10.7374 11.3232 10.2626 11.0303 9.96967L9.96967 11.0303ZM15.767 18.75C15.3528 18.75 15.017 19.0858 15.017 19.5C15.017 19.9142 15.3528 20.25 15.767 20.25V18.75ZM19.5 20.25C19.9142 20.25 20.25 19.9142 20.25 19.5C20.25 19.0858 19.9142 18.75 19.5 18.75V20.25ZM18.75 19.5C18.75 19.9142 19.0858 20.25 19.5 20.25C19.9142 20.25 20.25 19.9142 20.25 19.5H18.75ZM20.25 15.767C20.25 15.3528 19.9142 15.017 19.5 15.017C19.0858 15.017 18.75 15.3528 18.75 15.767H20.25ZM18.9697 20.0303C19.2626 20.3232 19.7374 20.3232 20.0303 20.0303C20.3232 19.7374 20.3232 19.2626 20.0303 18.9697L18.9697 20.0303ZM15.0303 13.9697C14.7374 13.6768 14.2626 13.6768 13.9697 13.9697C13.6768 14.2626 13.6768 14.7374 13.9697 15.0303L15.0303 13.9697ZM6.25 15.767C6.25 15.3528 5.91421 15.017 5.5 15.017C5.08579 15.017 4.75 15.3528 4.75 15.767H6.25ZM4.75 19.5C4.75 19.9142 5.08579 20.25 5.5 20.25C5.91421 20.25 6.25 19.9142 6.25 19.5H4.75ZM5.5 18.75C5.08579 18.75 4.75 19.0858 4.75 19.5C4.75 19.9142 5.08579 20.25 5.5 20.25V18.75ZM9.233 20.25C9.64721 20.25 9.983 19.9142 9.983 19.5C9.983 19.08579 9.64721 18.75 9.233 18.75V20.25ZM4.96967 18.9697C4.67678 19.2626 4.67678 19.7374 4.96967 20.0303C5.26256 20.3232 5.73744 20.3232 6.03033 20.0303L4.96967 18.9697ZM11.0303 15.0303C11.3232 14.7374 11.3232 14.2626 11.0303 13.9697C10.7374 13.6768 10.2626 13.6768 9.96967 13.9697L11.0303 15.0303ZM15.767 4.75C15.3528 4.75 15.017 5.08579 15.017 5.5C15.017 5.91421 15.3528 6.25 15.767 6.25V4.75ZM19.5 6.25C19.9142 6.25 20.25 5.91421 20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75V6.25ZM20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75C19.0858 4.75 18.75 5.08579 18.75 5.5H20.25ZM18.75 9.233C18.75 9.64721 19.0858 9.983 19.5 9.983C19.91421 9.983 20.25 9.64721 20.25 9.233H18.75ZM20.0303 6.03033C20.3232 5.73744 20.3232 5.26256 20.0303 4.96967C19.7374 4.67678 19.2626 4.67678 18.9697 4.96967L20.0303 6.03033ZM13.9697 9.96967C13.6768 10.2626 13.6768 10.7374 13.9697 11.0303C14.2626 11.3232 14.7374 11.3232 15.0303 11.0303L13.9697 9.96967ZM6.25 9.233V5.5H4.75V9.233H6.25ZM5.5 6.25H9.233V4.75H5.5V6.25ZM4.96967 6.03033L9.96967 11.0303L11.0303 9.96967L6.03033 4.96967L4.96967 6.03033ZM15.767 20.25H19.5V18.75H15.767V20.25ZM20.25 19.5V15.767H18.75V19.5H20.25ZM20.0303 18.9697L15.0303 13.9697L13.9697 15.0303L18.9697 20.0303L20.0303 18.9697ZM4.75 15.767V19.5H6.25V15.767H4.75ZM5.5 20.25H9.233V18.75H5.5V20.25ZM6.03033 20.0303L11.0303 15.0303L9.96967 13.9697L4.96967 18.9697L6.03033 20.0303ZM15.767 6.25H19.5V4.75H15.767V6.25ZM18.75 5.5V9.233H20.25V5.5H18.75ZM18.9697 4.96967L13.9697 9.96967L15.0303 11.0303L20.0303 6.03033L18.9697 4.96967Z" fill="#050505"/>
    </svg>`;
}

/**
 * Generates an SVG icon for a left chevron (scroll left).
 * 
 * @returns {string} - SVG markup representing the left chevron icon.
 */
const chevronLeftIcon = () => {
    return `<svg 
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#050505"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round">
    <polyline points="15 18 9 12 15 6" />
    </svg>`;
}

/**
 * Generates an SVG icon for a right chevron (scroll right).
 * 
 * @returns {string} - SVG markup representing the right chevron icon.
 */
const chevronRightIcon = () => {
    return `<svg 
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#050505"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6" />
    </svg>`;
}

/**
 * Generates an SVG icon for a chevron expand action.
 * 
 * @returns {string} - SVG markup representing the chevron expand icon.
 */
const chevronExpandIcon = () => {
    return `<svg 
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#050505"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round">
    <path d="M7 15l5 5 5-5" />
    <path d="M7 9l5-5 5 5" />
    </svg>`;
}

/**
 * Generates an SVG icon for a chevron shrink action.
 * 
 * @returns {string} - SVG markup representing the chevron shrink icon.
 */
const chevronShrinkIcon = () => {
    return `<svg 
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#050505"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round">
    <path d="M7 20l5-5 5 5" />
    <path d="M7 4l5 5 5-5" />
    </svg>`;
}

/**
 * Create the class for using this library
 */
class lcsCalendar {

    /**
     * Creates an instance of the lcsCalendar class.
     * @param {Object} config - The configuration object for calendar settings.
     * @param {number} [config.year=currentYear] - The year to display on the calendar.
     * @param {number} [config.month=currentMonth] - The month to display on the calendar (1 for January to 12 for December).
     * @param {number} [config.yearStart=oldestYear] - The starting year for the year selection.
     * @param {number} [config.yearEnd=nextYear] - The ending year for the year selection.
     * @param {string} [config.purpose='showcase'] - The purpose of the calendar ('showcase' or 'input').
     * @param {boolean} [config.flexible=false] - Whether the calendar can expand and shrink.
     * @param {boolean} [config.expanded=false] - Whether the calendar should initially display in expanded mode.
     * @param {string} [config.conclusionCallback='defaultConclusionCallback'] - Function to execute after user have selected year, month, date (only for 'input' purpose)
     * 
     * @throws {Error} If year or month is out of the valid range, or if purpose is not 'showcase' or 'input'.
     */
    constructor({
        year = currentYear,
        month = currentMonth,
        yearStart = oldestYear,
        yearEnd = nextYear,
        purpose = 'showcase',
        flexible = false,
        expanded = false,
        conclusionCallback = 'defaultConclusionCallback'
    } = {}) {
        
        // Validate year provision
        if (year === null || year === undefined) {
            this.yearOnBrowse = currentYear;
        } else if (year < oldestYear || year > newestYear) {
            throw new Error("Year must be between 100 years ago and 10 years from now");
        } else {
            this.yearOnBrowse = year;
        }

        // Validate month provision
        if (month === null || month === undefined) {
            if (this.yearOnBrowse !== currentYear) {
                this.monthOnBrowse = 1;
            } else {
                this.monthOnBrowse = currentMonth;
            }
        } else if (month < 1 || month > 12) {
            throw new Error("Month must be provided in human-readable format (e.g., 1 for Jan to 12 for Dec)");
        } else {
            this.monthOnBrowse = month;
        }

        this.yearStartFrom = yearStart || 2020;
        this.yearEndAt = yearEnd || nextYear;

        // Validate yearStart provision 
        if (this.yearStartFrom < oldestYear) {
            throw new Error("Year start must be between 100 years ago and 10 years from now");
        } else if (this.yearStartFrom > this.yearOnBrowse) {
            this.yearStartFrom = this.yearOnBrowse;
        }

        // Validate yearEnd provision
        if (this.yearEndAt > newestYear) {
            throw new Error("Year end must be between 100 years ago and 10 years from now");
        } else if (this.yearEndAt < this.yearOnBrowse) {
            this.yearEndAt = this.yearOnBrowse
        }

        // Validate purpose
        if (!["showcase", "input"].includes(purpose)) {
            throw new Error("Purpose must be either 'showcase' or 'input'");
        } else {
            this.useAs = purpose;
        }

        this.setFlexible = flexible || false;
        this.setExpanded = expanded || false;

        // Validate conclusionCallback
        if (conclusionCallback) {
            if (typeof window[conclusionCallback] === 'function') {
                doOnSelection = conclusionCallback;
            } else {
                throw new Error("Specified conclusionCallback function is not defined");
            }
        }

        this.#setCalendar();
    }

    /**
     * Private method to generate the calendar structure and elements.
     * Initializes the calendar container, header, and body sections, setting up navigation and options based on configuration.
     */
    #setCalendar() {
        // Retrieve any existing active calendar instance
        const activeCalendar = document.querySelector("#lcsCalendar.activeCalendar");

        // Create primary calendar container element
        const calendarMain = document.createElement("div");
        calendarMain.id = "lcsCalendar";
        calendarMain.classList.add("lcsCalendar");
        // Set attributes for flexible view, expanded state, purpose, and year range
        calendarMain.setAttribute("data-cflexible", this.setFlexible);
        calendarMain.setAttribute("data-cexpanded", this.setExpanded);
        calendarMain.setAttribute("data-cpurpose", this.useAs);
        calendarMain.setAttribute("data-cys", this.yearStartFrom);
        calendarMain.setAttribute("data-cye", this.yearEndAt);

        /* --------- HEADER SECTION --------- */

        // Create calendar header container
        const calendarHeader = document.createElement("div");
        calendarHeader.classList.add("calendarHeader");

        // Create header bar 1: displays today's date
        const calendarHeaderBar1 = document.createElement("div");
        calendarHeaderBar1.classList.add("calendarHeaderBar1");

        // Insert current date information in header bar 1
        const todaysDateInfo = document.createElement("p");
        todaysDateInfo.classList.add("todaysDateInfo");
        todaysDateInfo.innerHTML = `Today is ${dayNames[currentDayByIndex]}, ${setOrdinalIndicators(currentDate)} ${monthNames[currentMonthByIndex]}, ${currentYear}`;
        calendarHeaderBar1.appendChild(todaysDateInfo);

        // Create header bar 2: contains year/month navigation and flexibility toggle
        const calendarHeaderBar2 = document.createElement("div");
        calendarHeaderBar2.classList.add("calendarHeaderBar2");

        // Wrapper for year/month navigation
        const listOfYMNavWrapper = document.createElement("div");
        listOfYMNavWrapper.classList.add("calendarLOYMNWrapper");

        /* Year Navigation Setup */
        const listOfYearsNav = document.createElement("nav");
        listOfYearsNav.classList.add("calendarLOYN");
        const listOfYearsWrapper = document.createElement("ul");

        // Populate list of year buttons within range
        let yearListCount = (this.yearEndAt + 1) - this.yearStartFrom;
        for (let i = 0; i < yearListCount; i++) {
            const yearNumber = this.yearStartFrom++;
            const listOfYear = document.createElement("li");
            const listOfYearButton = document.createElement("button");
            listOfYearButton.classList.add("calendarLOY");
            listOfYearButton.setAttribute("data-loy", yearNumber);

            // Set attributes for "input" mode and current browsing year
            if (this.useAs === "input") listOfYearButton.setAttribute("data-cyear", yearNumber);
            if (this.yearOnBrowse === yearNumber) listOfYearButton.setAttribute("data-yob", yearNumber);
            
            listOfYearButton.textContent = yearNumber;
            listOfYear.appendChild(listOfYearButton);
            listOfYearsWrapper.appendChild(listOfYear);
        }

        // Add expand/collapse control and navigation arrows to year navigation
        const expandControlIcon = `<span class="calendarLOYN_cIcon calendarLOYN_cExpand">${chevronExpandIcon()}</span>`;
        listOfYearsNav.insertAdjacentHTML("afterbegin", `<span class="calendarLOYN_eControl">${expandControlIcon}</span>`);
        listOfYearsNav.appendChild(listOfYearsWrapper);

        const controlLeftIcon = `<span class="calendarLOYN_cIcon calendarLOYN_cLeft">${chevronLeftIcon()}</span>`;
        const controlRightIcon = `<span class="calendarLOYN_cIcon calendarLOYN_cRight">${chevronRightIcon()}</span>`;
        listOfYearsNav.insertAdjacentHTML("beforeend", `<span class="calendarLOYN_xControl">${controlLeftIcon}${controlRightIcon}</span>`);
        listOfYMNavWrapper.appendChild(listOfYearsNav);

        /* Month Navigation Setup */
        const listOfMonthsNav = document.createElement("nav");
        listOfMonthsNav.classList.add("calendarLOMN");
        const listOfMonthsWrapper = document.createElement("ul");

        // Populate list of month buttons for navigation
        monthNames.forEach((monthName, index) => {
            const monthNumber = index + 1;
            const listOfMonth = document.createElement("li");
            const listOfMonthButton = document.createElement("button");
            listOfMonthButton.classList.add("calendarLOM");
            listOfMonthButton.setAttribute("data-yob", this.yearOnBrowse);
            listOfMonthButton.setAttribute("data-lom", monthNumber);

            // Set attributes for "input" mode and current browsing month
            if (this.useAs === "input") listOfMonthButton.setAttribute("data-cmonth", monthNumber);
            if (this.monthOnBrowse === monthNumber) listOfMonthButton.setAttribute("data-mob", monthNumber);
            
            listOfMonthButton.textContent = monthName;
            listOfMonth.appendChild(listOfMonthButton);
            listOfMonthsWrapper.appendChild(listOfMonth);
        });

        listOfMonthsNav.appendChild(listOfMonthsWrapper);
        listOfYMNavWrapper.appendChild(listOfMonthsNav);
        calendarHeaderBar2.appendChild(listOfYMNavWrapper);

        // Add flexibility toggle if "flexible" is enabled in configuration
        if (this.setFlexible) {
            const calendarFlexibilityToggleWrapper = document.createElement("div");
            calendarFlexibilityToggleWrapper.classList.add("calendarFlexibilityToggleWrapper");

            const calendarFlexibilityToggle = document.createElement("span");
            calendarFlexibilityToggle.classList.add("calendarFlexibilityToggle");
            
            const toggleLabel = this.setExpanded ? "Shrink" : "Expand";
            const toggleIcon = this.setExpanded ? shrinkIcon() : expandIcon();
            
            calendarFlexibilityToggle.setAttribute("data-cftl", toggleLabel);
            calendarFlexibilityToggle.innerHTML = `${toggleIcon}<span>${toggleLabel}</span>`;
            
            calendarFlexibilityToggleWrapper.appendChild(calendarFlexibilityToggle);
            calendarHeaderBar2.appendChild(calendarFlexibilityToggleWrapper);
        }

        // Append header bars to the calendar header
        calendarHeader.append(calendarHeaderBar1, calendarHeaderBar2);

        /* --------- BODY SECTION --------- */

        // Create calendar body to contain month tables, setting browsing year and month
        const calendarBody = document.createElement("div");
        calendarBody.classList.add("calendarBody");
        calendarBody.setAttribute("data-yob", this.yearOnBrowse);
        calendarBody.setAttribute("data-mob", this.monthOnBrowse);

        const totalMonths = this.setExpanded ? 12 : 1;

        for (let i = 0; i < totalMonths; i++) {
            const thisMonth = totalMonths === 1 ? this.monthOnBrowse : i + 1;

            // Create individual month container
            const calendarMonth = document.createElement("div");
            calendarMonth.classList.add("calendarMonth");

            // Highlight the current or browsing month
            if (this.setExpanded && this.yearOnBrowse === currentYear && thisMonth === currentMonth) {
                calendarMonth.id = "CM";
            }
            if (this.setExpanded && thisMonth !== currentMonth && this.monthOnBrowse === thisMonth) {
                calendarMonth.id = "MOB";
            }

            /* Month Header */
            const calendarMonthHeader = document.createElement("div");
            calendarMonthHeader.classList.add("calendarMonthHeader");

            // Display the current month name and year
            const calendarMonthYearDisplay = document.createElement("div");
            calendarMonthYearDisplay.innerHTML = `${monthNames[thisMonth - 1]} ${this.yearOnBrowse}`;
            calendarMonthHeader.appendChild(calendarMonthYearDisplay);

            /* Month Body */
            const calendarMonthBody = document.createElement("div");
            calendarMonthBody.classList.add("calendarMonthBody");

            // Create table structure for month view
            const calendarMonthTable = document.createElement("table");

            // Table Header: Weekday names
            const calendarMonthTableHeader = document.createElement("thead");
            const calendarMonthTableHeaderRow = document.createElement("tr");

            // Add day names as column headers (e.g., Sun, Mon)
            dayNames.forEach(dayName => {
                const dayHeader = document.createElement("th");
                dayHeader.setAttribute("data-dfn", dayName);
                dayHeader.innerText = extractString(dayName, 3);
                calendarMonthTableHeaderRow.appendChild(dayHeader);
            });

            calendarMonthTableHeader.appendChild(calendarMonthTableHeaderRow);
            calendarMonthTable.appendChild(calendarMonthTableHeader);

            /* Month Table Body */
            const daysCount = getDaysCountInAMonth(this.yearOnBrowse, thisMonth);
            const firstDayStart = getDayOfMonthStart(this.yearOnBrowse, thisMonth);

            const calendarMonthTableBody = document.createElement("tbody");

            if (firstDayStart) {
                // Initial row with correct start position for the first day of the month
                const calendarMonthTableBodyInitRow = document.createElement("tr");
                let emptyCells = firstDayStart - 1;
                let activeDays = 7 - emptyCells;

                // Add empty cells to align the first day correctly
                while (emptyCells > 0) {
                    calendarMonthTableBodyInitRow.appendChild(document.createElement("td"));
                    emptyCells--;
                }

                // Add active days in the first row
                for (let i = 0; i < activeDays; i++) {
                    const dateNumber = i + 1;
                    const dateCell = document.createElement("td");

                    if (this.useAs === "input") {
                        dateCell.setAttribute("data-cdate", dateNumber);
                        dateCell.classList.add("calendarDate");
                    }

                    if (dateOfToday(dateNumber, thisMonth, this.yearOnBrowse)) {
                        dateCell.id = "DOT";
                    }

                    dateCell.innerText = dateNumber;
                    calendarMonthTableBodyInitRow.appendChild(dateCell);
                }

                calendarMonthTableBody.appendChild(calendarMonthTableBodyInitRow);

                /** 
                 * Now creating the rest of the rows, each row having a minimum of 7 cols (Sunday to Saturday)
                 * To make this work by 7, we check and remove the remainder when rest of days is divided by 7.
                 * i.e. assuming that after initial row above, 31 days remains 26 days (from 6 to 31) as rest of days after 5 days (from 1 to 5) was removed to
                 * serve as cols for the init row. Now dividing 26 by 7 gives us (7 * 3) + 5; so below codes will create 3 rows to
                 * accommodate 21 days (from 6 to 26). Then later we create extra row and fill in 5 cols as the remaining 5 days (from 27 to 31)
                 * 
                 */ 

                const restOfDaysAfterInitRow = daysCount - activeDays;
                let remainderDays = restOfDaysAfterInitRow % 7;
                const rowsBy7Days = restOfDaysAfterInitRow - remainderDays;

                // Generate complete rows for weeks with 7 days
                for (let i = 0; i < rowsBy7Days; i++) {
                    if (i % 7 === 0) {
                        const weekRow = document.createElement("tr");
                        for (let j = 0; j < 7; j++) {
                            const dateNumber = ++activeDays;
                            const dateCell = document.createElement("td");

                            if (this.useAs === "input") {
                                dateCell.setAttribute("data-cdate", dateNumber);
                                dateCell.classList.add("calendarDate");
                            }

                            if (dateOfToday(dateNumber, thisMonth, this.yearOnBrowse)) {
                                dateCell.id = "DOT";
                            }

                            dateCell.innerText = dateNumber;
                            weekRow.appendChild(dateCell);
                        }
                        calendarMonthTableBody.appendChild(weekRow);
                    }
                }

                // Generate row for remaining days, if any
                if (remainderDays > 0) {
                    const remainderRow = document.createElement("tr");
                    while (remainderDays > 0) {
                        const dateNumber = ++activeDays;
                        const dateCell = document.createElement("td");

                        if (this.useAs === "input") {
                            dateCell.setAttribute("data-cdate", dateNumber);
                            dateCell.classList.add("calendarDate");
                        }

                        if (dateOfToday(dateNumber, thisMonth, this.yearOnBrowse)) {
                            dateCell.id = "DOT";
                        }

                        dateCell.innerText = dateNumber;
                        remainderRow.appendChild(dateCell);
                        remainderDays--;
                    }
                    calendarMonthTableBody.appendChild(remainderRow);
                }
            }

            // Append header and body to month table, then add to month body container
            calendarMonthTable.appendChild(calendarMonthTableBody);
            calendarMonthBody.appendChild(calendarMonthTable);

            // Append month header and body to month container
            calendarMonth.append(calendarMonthHeader, calendarMonthBody);

            // Append month container to calendar body
            calendarBody.appendChild(calendarMonth);
        }

        /* --------- FOOTER SECTION --------- */
        const calenderFooter = document.createElement("div");
        calenderFooter.id = "calenderFooter";
        calenderFooter.classList.add("calenderFooter");
        calenderFooter.setAttribute("style", "display: flex !important; visibility: visible !important;");

        // Create watermark elements to be inserted into calenderFooter
        const lcsWaterMark = document.createElement("div");
        lcsWaterMark.id = "lwm";
        lcsWaterMark.classList.add("lwm");
        lcsWaterMark.setAttribute("onclick", `window.open('https://lcs.ng?nvflc=${window.location.origin}', '_blank')`);
        lcsWaterMark.setAttribute("style", "display: flex !important; visibility: visible !important;");
        const lcsWaterMarkLabel = document.createElement("span");
        lcsWaterMarkLabel.id = "lwmLabel";
        lcsWaterMarkLabel.classList.add("lwmLabel");
        lcsWaterMarkLabel.setAttribute("style", "display: flex !important; visibility: visible !important;");
        const lcsNameElement = `<strong style="display: inline-block !important; visibility: visible !important;">lcs.ng</strong>`;
        lcsWaterMarkLabel.innerHTML = lcsNameElement;
        lcsWaterMark.innerHTML = lcsWaterMarkLabel.outerHTML;
        const lcsWaterMarkElement = lcsWaterMark.outerHTML;

        // Create 'Done' button only if purpose 'input'
        let calendarSelectionDoneElement = '';
        if (this.useAs === "input") {
            const calendarSelectionDone = document.createElement("div");
            calendarSelectionDone.id = "calendarSelectionDone";
            calendarSelectionDone.innerHTML = `<button id="CSDB" type="button">Done</button>`;
            calendarSelectionDoneElement = calendarSelectionDone.outerHTML;
        }
        calenderFooter.innerHTML = `
            ${lcsWaterMarkElement} 
            ${calendarSelectionDoneElement}
        `;
        

        // Insert calendarHeader if not present; remove existing calendarBody and add the new one
        if (activeCalendar) {
            if (!activeCalendar.querySelector(".calendarHeader")) activeCalendar.appendChild(calendarHeader);
            const existingCalendarBody = activeCalendar.querySelector(".calendarBody");
            if (existingCalendarBody) existingCalendarBody.remove();
            activeCalendar.querySelector(".calendarHeader").insertAdjacentHTML("afterend", calendarBody.outerHTML);
            this.calendarElement = activeCalendar;
        } else {
            calendarMain.append(calendarHeader, calendarBody, calenderFooter);
            this.calendarElement = calendarMain.outerHTML;
        }
    }

    /**
     * Retrieves the HTML representation of the calendar.
     * 
     * @returns {string} The HTML content of the calendar.
     */
    calendarHTML() {
        return this.calendarElement;
    }
    
}



/**
 * User interactions and modifications to the calendar
 * This event listener handles clicks on calendar elements, including year and month selection,
 * as well as toggling between expanded and shrunk views.
 */
document.addEventListener("click", function(event) {

    // Set the calendar to activeCalendar if a click occurs within it
    const targetCalendar = event.target.closest("#lcsCalendar");
    if (targetCalendar) {
        targetCalendar.classList.add("activeCalendar");
    } else {
        const allCalendars = document.querySelectorAll("#lcsCalendar");
        if (allCalendars.length > 0) {
            allCalendars.forEach((thisCalendar) => {
                if (thisCalendar.classList.contains("activeCalendar")) {
                    thisCalendar.classList.remove("activeCalendar");
                }
            });
        }
    }

    // Handle clicks on the year button list
    const cLOYBtarget = event.target.closest(".calendarLOY");
    if (cLOYBtarget) {
        const selectedYear = parseInt(cLOYBtarget.getAttribute("data-loy"), 10);
        const thisCalendar = cLOYBtarget.closest("#lcsCalendar");

        // Set the clicked year as the year on browse
        const allYearList = thisCalendar.querySelectorAll(".calendarLOY");
        allYearList.forEach((ay) => {
            if (ay.hasAttribute("data-yob")) {
                ay.removeAttribute("data-yob");
            }
        })
        cLOYBtarget.setAttribute("data-yob", selectedYear);

        // Define month to set as month on browse
        const mobNumber = selectedYear === currentYear ? currentMonth : 1;

        // Update all months list to have the selected year as the year on browse
        const allMonthList = thisCalendar.querySelectorAll(".calendarLOM");
        if (allMonthList.length > 0) {
            allMonthList.forEach((am) => {
                am.setAttribute("data-yob", selectedYear);
                // Reset month on browse
                if (am.hasAttribute("data-mob")) {
                    am.removeAttribute("data-mob");
                }
                // Retrieve month's number
                const mNumber = parseInt(am.getAttribute("data-lom"), 10); 
                if (mNumber === mobNumber) {
                    am.setAttribute("data-mob", mobNumber);
                }
            })
        }

        // Create a new instance of lcsCalendar with the selected parameters
        new lcsCalendar({
            year: selectedYear,
            month: mobNumber,
            yearStart: parseInt(thisCalendar.getAttribute("data-cys"), 10),
            yearEnd: parseInt(thisCalendar.getAttribute("data-cye"), 10),
            purpose: thisCalendar.getAttribute("data-cpurpose"),
            flexible: toBoolean(thisCalendar.getAttribute("data-cflexible")),
            expanded: toBoolean(thisCalendar.getAttribute("data-cexpanded"))
        });

    }

    // Handle clicks on the month button list
    const cLOMBtarget = event.target.closest(".calendarLOM");
    if (cLOMBtarget) {
        const thisCalendar = cLOMBtarget.closest("#lcsCalendar");
        const YOB = parseInt(cLOMBtarget.getAttribute("data-yob"), 10);
        const selectedMonth = parseInt(cLOMBtarget.getAttribute("data-lom"), 10);

        // Reset month on browse
        const allMonthList = thisCalendar.querySelectorAll(".calendarLOM");
        allMonthList.forEach((am) => {
            if (am.hasAttribute("data-mob")) {
                am.removeAttribute("data-mob");
            }
        })

        // Set the selected Month as the month on browse
        cLOMBtarget.setAttribute("data-mob", selectedMonth);

        // Create a new instance of lcsCalendar with the selected parameters
        new lcsCalendar({
            year: YOB,
            month: selectedMonth,
            yearStart: parseInt(thisCalendar.getAttribute("data-cys"), 10),
            yearEnd: parseInt(thisCalendar.getAttribute("data-cye"), 10),
            purpose: thisCalendar.getAttribute("data-cpurpose"),
            flexible: toBoolean(thisCalendar.getAttribute("data-cflexible")),
            expanded: toBoolean(thisCalendar.getAttribute("data-cexpanded"))
        });
    }

    // Toggle the flexibility (expand/shrink) of the calendar
    const cFT = event.target.closest(".calendarFlexibilityToggle");
    if (cFT) {
        const thisCalendar = cFT.closest("#lcsCalendar");
        let calendarIsExpanded = toBoolean(thisCalendar.getAttribute("data-cexpanded"));

        // Toggle expanded state
        calendarIsExpanded = !calendarIsExpanded;
        thisCalendar.setAttribute("data-cexpanded", calendarIsExpanded);
        cFT.innerHTML = '';
        cFT.insertAdjacentHTML(
            "beforeend",
            (calendarIsExpanded ? shrinkIcon() : expandIcon()) + `<span>${calendarIsExpanded ? 'Shrink' : 'Expand'}</span>`
        );

        // Create a new instance of lcsCalendar with updated expanded state
        new lcsCalendar({
            year: parseInt(thisCalendar.querySelector(".calendarBody").getAttribute("data-yob"), 10),
            month: parseInt(thisCalendar.querySelector(".calendarBody").getAttribute("data-mob"), 10),
            yearStart: parseInt(thisCalendar.getAttribute("data-cys"), 10),
            yearEnd: parseInt(thisCalendar.getAttribute("data-cye"), 10),
            purpose: thisCalendar.getAttribute("data-cpurpose"),
            flexible: toBoolean(thisCalendar.getAttribute("data-cflexible")),
            expanded: calendarIsExpanded
        });

        scrollToSelectedYear();
    }

    // Handle year, month, and date selection in input mode
    const yearSelection = event.target.closest(".calendarLOY[data-cyear]");
    if (yearSelection) {
        const yearValue = parseInt(yearSelection.getAttribute("data-cyear"), 10);
        const inputToReceiveYearValue = document.querySelector(".getCalendarSelectedYear");
        if (inputToReceiveYearValue) {
            if (!isInputElement(inputToReceiveYearValue)) {
                throw new Error("The element provided to receive the year value must be a valid input element.");
            }
            inputToReceiveYearValue.value = yearValue;
        }
        selectedYearValue = yearValue;
        yearSelected = true;
    }
    const monthSelection = event.target.closest(".calendarLOM[data-cmonth]");
    if (monthSelection) {
        const monthValue = parseInt(monthSelection.getAttribute("data-cmonth"), 10);
        const inputToReceiveMonthValue = document.querySelector(".getCalendarSelectedMonth");
        if (inputToReceiveMonthValue) {
            if (!isInputElement(inputToReceiveMonthValue)) {
                throw new Error("The element provided to receive the month value must be a valid input element.");
            }
            inputToReceiveMonthValue.value = monthValue;
        }
        selectedMonthValue = monthValue;
        monthSelected = true;
    }
    const dateSelection = event.target.closest(".calendarDate[data-cdate]");
    if (dateSelection) {
        const dateValue = parseInt(dateSelection.getAttribute("data-cdate"), 10);
        const inputToReceiveDateValue = document.querySelector(".getCalendarSelectedDate");
        if (inputToReceiveDateValue) {
            if (!isInputElement(inputToReceiveDateValue)) {
                throw new Error("The element provided to receive the date value must be a valid input element.");
            }
            inputToReceiveDateValue.value = dateValue;
        }
        selectedDateValue = dateValue;
        dateSelected = true;
    }

    // Handle year list navigation
    const yearNavIcon = event.target.closest(".calendarLOYN_cIcon");
    if (yearNavIcon) {
        const thisNav = yearNavIcon.closest(".calendarLOYN");
        const listsElement = thisNav.querySelector("ul");
        if (yearNavIcon.classList.contains("calendarLOYN_cLeft")) {
            scrollElementTo(listsElement, "left", 80);
        } else if (yearNavIcon.classList.contains("calendarLOYN_cRight")) {
            scrollElementTo(listsElement, "right", 80);
        }
    }
    
});



document.addEventListener("DOMContentLoaded", () => {
    scrollToSelectedYear();
});