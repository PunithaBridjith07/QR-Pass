import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from "@angular/forms";
import { catchError, Observable, of, switchMap } from "rxjs";

//  db Configurations
const baseURL: string = "https://192.168.57.185:5984/qrpass";
const username = "d_couchdb";
const password = "Welcome#2";
const headers = new HttpHeaders({
    Authorization: "Basic " + btoa(username + ":" + password),
    "Content-type": "application/json",
});

//  SubscriptionDetail Interface
export interface SubscribedDetail {
    _id: string;
    _rev?: string;
    data: {
        user: string;
        subscriptionplan: string;
        subscriptionoffer: string;
        startdate: string;
        enddate: string;
        daysvalid: number;
        status: "active" | "expired";
        type: "subscribeddetail";
    };
}

export interface EventData {
    _id: string;
    _rev?: string;
    data: {
        eventname: string;
        artist: string;
        date: string;
        time: string;
        seats: number;
        price: number;
        venue: string;
        state: string;
        district: string;
        locationviamap: string;
        offerapplicable: number;
        offerpercent: number;
        description: string;
        imageurl: string;
        user: string;
        createdat: string;
        type: "event";
    }
}

export interface Seat {
    _id: string;
    _rev?: string;
    data: {
        event: string;
        type: "seat";
        seats: {
            [seatNumber: `s${number}`]: seatStatus; // Allows dynamic seat keys (e.g., s1, s2, s3, ...)
        }
    };
}

type seatStatus = "available" | "sold"

//  Form Async Validation Methods
export function isArtistAvailable(http: HttpClient, controlName1: string, controlName2: string, editEventId?: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null);
        }
        const form = control.parent;


        const artist = form?.get(controlName1)?.value;
        const date = form?.get(controlName2)?.value;  // Date object from form

        const URL = `${baseURL}/_design/Views/_view/eventbyid`;

        return http.get<{ rows: any[] }>(URL, { headers: headers }).pipe(
            switchMap((response) => {
                const existEvent = response.rows
                    .map((event) => event.value)
                    .filter((eventData) => eventData._id !== editEventId);


                const isConflict = existEvent.some((event) => {
                    const eventData = event.data;

                    if (eventData.artist === artist) {
                        // Convert stored event time (ISO) to Date object
                        const existEventTime = new Date(eventData.time);

                        // Restricted time window (4 hours after existing event)
                        const restrictedEndTime = new Date(existEventTime);
                        restrictedEndTime.setHours(restrictedEndTime.getHours() + 4);

                        // Current event time from form (Convert to full Date object)
                        const [currentEventHr, currentEventMin] = control.value.split(":").map(Number);
                        const currentEventTime = new Date(date);
                        currentEventTime.setHours(currentEventHr, currentEventMin, 0, 0);

                        const isWithinRestrictedWindow = currentEventTime >= existEventTime && currentEventTime <= restrictedEndTime;
                        console.log("Conflict:", isWithinRestrictedWindow);

                        return isWithinRestrictedWindow;
                    }
                    return false;
                });

                return isConflict ? of({ artistNotAvail: true }) : of(null);
            }),
            catchError(() => of(null))
        );
    };
}

export function isVenueAvailable(http: HttpClient, controlName1: string, controlName2: string, isEditEvent: boolean): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null)
        }
        if (isEditEvent) {
            return of(null)
        }
        const form = control.parent
        const date = form?.get(controlName1)?.value
        const time = form?.get(controlName2)?.value
        const URL = `${baseURL}/_design/Views/_view/eventbyid`;

        return http.get<{ rows: any[] }>(URL, { headers: headers }).pipe(
            switchMap((response) => {
                const isConflict = response.rows.some((event) => event.value.data.date === date && event.value.data.time === time && event.value.data.venue === control.value)
                return isConflict ? of({ venueNotAvail: true }) : of(null)
            }),
            catchError((err) => { return of(null) })
        )
    }
}

export function isVenueChanged(http: HttpClient, controlName1: string, uploadImageControl: string, isEditEvent: boolean): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value || !isEditEvent) {
            return of(null);
        }

        const form = control.parent;
        const newVenue = form?.get(controlName1)?.value;
        const uploadedImage = form?.get(uploadImageControl)?.value;
        const URL = `${baseURL}/_design/Views/_view/eventbyid`;

        return http.get<{ rows: any[] }>(URL, { headers: headers }).pipe(
            switchMap((response) => {
                const existingVenue = response.rows.length > 0 ? response.rows[0].value.data.venue : null;

                // Check if the venue has changed
                if (existingVenue && existingVenue !== newVenue) {
                    // If the venue changed but no image is uploaded, return an error
                    if (!uploadedImage) {
                        return of({ venueChangedError: true });
                    }
                }

                return of(null);
            }),
            catchError(() => of(null))
        );
    };
}

export function offerPercentValid(controlName1: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const parent = control.parent;
        if (!parent) return null; // Ensure parent exists

        const offerApplicable = Number(parent.get(controlName1)?.value);
        if (offerApplicable > 0 && (Number(control.value) === 0 || control.value === "")) {
            return { invalidValue: true };
        }
        return null;
    };
}

export type State =
    | "Andhra Pradesh"
    | "Arunachal Pradesh"
    | "Assam"
    | "Bihar"
    | "Chhattisgarh"
    | "Goa"
    | "Gujarat"
    | "Haryana"
    | "Himachal Pradesh"
    | "Jharkhand"
    | "Karnataka"
    | "Kerala"
    | "Madhya Pradesh"
    | "Maharashtra"
    | "Manipur"
    | "Meghalaya"
    | "Mizoram"
    | "Nagaland"
    | "Odisha"
    | "Punjab"
    | "Rajasthan"
    | "Sikkim"
    | "TamilNadu"
    | "Telangana"
    | "Tripura"
    | "Uttar Pradesh"
    | "Uttarakhand"
    | "West Bengal";

export interface Districts {
    [key: string]: string[];
}


export const indianStates: State[] = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "TamilNadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
];


export const districts = {
    "Andhra Pradesh": [
        "Anakapalli", "Anantapur", "Annamayya", "Bapatla", "Chittoor", "East Godavari",
        "Eluru", "Guntur", "Kakinada", "Konaseema", "Krishna", "Kurnool", "Manyam",
        "Nandyal", "NTR", "Palnadu", "Prakasam", "Sri Potti Sriramulu Nellore",
        "Srikakulam", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari",
        "YSR (Kadapa)", "Alluri Sitharama Raju", "Parvathipuram Manyam"
    ],
    "Arunachal Pradesh": [
        "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle",
        "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley",
        "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare",
        "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri",
        "West Kameng", "West Siang"
    ],
    "Assam": [
        "Baksa", "Bajali", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
        "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara",
        "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan",
        "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon",
        "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar",
        "Tinsukia", "Tamulpur", "Udalguri", "West Karbi Anglong"
    ],
    "Bihar": [
        "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
        "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
        "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura",
        "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia",
        "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi",
        "Siwan", "Supaul", "Vaishali", "West Champaran"
    ],
    "Chhattisgarh": [
        "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur",
        "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi",
        "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya",
        "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon",
        "Sukma", "Surajpur", "Surguja", "Manendragarh-Chirmiri-Bharatpur",
        "Khairagarh-Chhuikhadan-Gandai", "Mohla-Manpur-Ambagarh Chowki",
        "Sarangarh-Bilaigarh", "Kawardha"
    ],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": [
        "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar",
        "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar",
        "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana",
        "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot",
        "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
    ],
    "Haryana": [
        "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar",
        "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh",
        "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
    ],
    "Himachal Pradesh": [
        "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti",
        "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
    ],
    "Jharkhand": [
        "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa",
        "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar",
        "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj",
        "Seraikela Kharsawan", "Simdega", "West Singhbhum"
    ],
    "Karnataka": [
        "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar",
        "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
        "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar",
        "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi",
        "Uttara Kannada", "Vijayapura", "Vijayanagara", "Yadgir"
    ],
    "Kerala": [
        "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam",
        "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram",
        "Thrissur", "Wayanad"
    ],
    "Madhya Pradesh": [
        "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"
    ],
    "Maharashtra": [
        "Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad",
        "Solapur"
    ],
    "Manipur": [
        "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam",
        "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong",
        "Tengnoupal", "Thoubal", "Ukhrul"
    ],
    "Meghalaya": [
        "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri-Bhoi",
        "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills",
        "West Jaintia Hills", "West Khasi Hills", "Eastern West Khasi Hills"
    ],
    "Mizoram": [
        "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit",
        "Saiha", "Saitual", "Serchhip"
    ],
    "Nagaland": [
        "Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland",
        "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"
    ],
    "Odisha": [
        "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh",
        "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi",
        "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj",
        "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    ],
    "Punjab": [
        "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur",
        "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali",
        "Muktsar", "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Malerkotla", "Tarn Taran"
    ],
    "Rajasthan": [
        "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi",
        "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer",
        "Jalor", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh",
        "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"
    ],
    "Sikkim": ["Gangtok", "Mangan", "Namchi", "Pakyong", "Soreng", "Gyalshing"],
    "TamilNadu": [
        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
        "Erode", "Kallakurichi", "Kanchipuram", "Kanniyakumari", "Karur", "Krishnagiri", "Madurai",
        "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
        "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni",
        "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupattur", "Tiruppur", "Tiruvallur",
        "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
    ],
    "Telangana": [
        "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial", "Jangaon",
        "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam",
        "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak",
        "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal",
        "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet",
        "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
    ],
    "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
    "Uttar Pradesh": [
        "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh",
        "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti",
        "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah",
        "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad",
        "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun",
        "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi",
        "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri",
        "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit",
        "Pratapgarh", "Prayagraj", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar",
        "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra",
        "Sultanpur", "Unnao", "Varanasi"
    ],
    "Uttarakhand": [
        "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital",
        "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar",
        "Uttarkashi"
    ],
    "West Bengal": [
        "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling",
        "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda",
        "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur",
        "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
    ]
};
