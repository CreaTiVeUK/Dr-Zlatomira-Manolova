export type Dictionary = typeof en;

export const en = {
    header: {
        utility: "Specialized pediatric care in Plovdiv",
        ageGroup: "Ageless 0-18 years",
        title: "Dr. Zlatomira Manolova",
        subtitle: "PEDIATRIC SPECIALIST",
        nav: {
            home: "HOME",
            services: "SERVICES",
            conditions: "CONDITIONS",
            resources: "RESOURCES",
            book: "BOOK NOW",
            contact: "CONTACT",
        },
        switchTitle: "Switch to Bulgarian"
    },
    footer: {
        title: "Manolova Pediatrics",
        desc: "Providing expert and compassionate pediatric care for children of all ages. Based in the heart of London.",
        links: "QUICK LINKS",
        location: "LOCATION",
        medicalCenter: "Medical Center",
        partnerHospital: "Partner Hospital",
        hours: "OPENING HOURS",
        hoursDetails: {
            weekdays: "Mon - Fri: 09:00 - 18:00",
            saturday: "Sat: 10:00 - 14:00",
            sunday: "Sun: Emergencies only"
        },
        rights: "Dr. Zlatomira Manolova. All rights reserved.",
        privacy: "Privacy Policy",
        terms: "Terms of Use"
    },
    home: {
        hero: {
            title: "Elite Medical Care",
            titleHighlight: "Dedicated to Children.",
            subtitle: "Providing the highest standard of pediatric expertise in the heart of Plovdiv, combining clinical excellence with deep compassionate care.",
            bookBtn: "Book Consultation",
            servicesBtn: "View Services",
        },
        trust: {
            reviews: "VERIFIED REVIEWS",
            partners: "PARTNERSHIP WITH LEADING CLINICS",
        },
        services: {
            title: "Clinical Experience",
            subtitle: "From routine checkups to specialized diagnostic clinics, we provide a full spectrum of pediatric care.",
            general: {
                title: "General Pediatrics",
                desc: "Expert management of acute childhood illnesses, routine health checks, and clinical vaccinations.",
                btn: "VIEW SERVICE →"
            },
            allergy: {
                title: "Allergy & Asthma",
                desc: "Specialized diagnostic testing and long-term treatment plans for complex childhood allergies.",
                btn: "VIEW SERVICE →"
            },
            newborn: {
                title: "Newborn Care",
                desc: "Specialized support for newborn health, feeding issues, and early development screening.",
                btn: "VIEW SERVICE →"
            }
        },
        about: {
            badge: "ESTABLISHED PEDIATRICIAN",
            name: "Dr. Zlatomira Manolova-Peneva",
            role: "Head of Second Pediatric Department",
            bio1: "Dr. Zlatomira Manolova-Peneva graduated from the Medical University of Plovdiv in 2018 and acquired a specialty in pediatrics in 2023. From the very beginning of her professional path, she focused her interests on child healthcare, striving for in-depth practical and theoretical training.",
            bio2: "She began her specialization in the Second Pediatric Department with an Intensive Care Sector at MHAT Pazardzhik, where she gained valuable clinical experience. During her training, she also passed through the Pediatric Clinic of UMHAT 'St. George' Plovdiv, which contributed to broadening her professional preparation and clinical view.",
            bio3: "After successfully completing her specialization, Dr. Manolova-Peneva continued her professional development as a specialist physician at MHAT Pazardzhik, while simultaneously becoming part of the team at the 'Plovdimed' 24-hour Children's Polyclinic in Plovdiv. Her work is aimed at providing quality and timely medical care for children of different age groups.",
            bio4: "In 2025, she took a leadership position as Head of Department – initially as acting head, and subsequently, after successfully passing a competition, as the titular head. Her professionalism, responsibility, and dedication to patients and the team are highly appreciated, and in 2023 she was nominated by the Bulgarian Medical Association in the category 'You are our future'.",
            qualifications: "QUALIFICATIONS",
            qualList: ["• MBBS Medical Degree", "• DCH Diploma in Child Health", "• MRCPCH Member of RCPCH", "• FRCPCH Fellow of RCPCH"],
            specialties: "SPECIALTIES",
            specList: ["• Pediatric Allergy", "• Early Child Development", "• Emergency Conditions", "• Neonatal Consultations"],
            bioBtn: "Request Full Biography",
            imageAlt: "Dr. Manolova Specialist"
        },
        heroImageAlt: "Clinical Consultation with Dr. Manolova",
        partnerImageAlt: "Partner Hospital Logos"
    },
    booking: {
        title: "Online Booking",
        subtitle: "Book your consultation with Dr. Manolova in a few easy steps.",
        step1: "1. Select Service",
        step2: "2. Select Date",
        step3: "3. Available Slots",
        services: {
            standard: "Standard Consultation",
            specialized: "Specialized Consultation"
        },
        confirm: {
            title: "Confirm Booking",
            text: "Confirm %s for %s?", // Keep placeholders generally adaptable
            btn: "CONFIRM APPOINTMENT",
            loading: "BOOKING..."
        },
        taken: "TAKEN",
        success: "Booking Successful!",
        error: "Booking failed."
    },
    contact: {
        title: "Book an Appointment",
        subtitle: "Contact Dr. Manolova for expert pediatric care and clinical diagnostics.",
        clinics: "Our Clinics",
        medicalCenter: "Medical Center",
        partnerHospital: "Partner Hospital",
        tel: "Tel",
        email: "Email",
        admin: {
            title: "Administration & Payments",
            text: "For administrative or payment related enquiries, please contact our central office between 09:00 - 17:00."
        },
        form: {
            title: "Inquiry Form",
            name: "FULL NAME",
            email: "EMAIL ADDRESS",
            msg: "MESSAGE",
            btn: "SEND INQUIRY" // Placeholder UI
        }
    },
    servicesPage: {
        title: "Our Pediatric Services",
        subtitle: "We provide a full spectrum of pediatric care - from routine preventative checks to specialized diagnostic clinics.",
        general: {
            title: "General Pediatrics",
            desc: "We ensure comprehensive health checks for children of all ages, ensuring their growth and development are on track.",
            list: [
                "• Comprehensive health assessments",
                "• Routine vaccinations and immunizations",
                "• Management of acute childhood illnesses",
                "• Growth and nutrition consultations"
            ],
            btn: "Book this appointment"
        },
        allergy: {
            title: "Pediatric Allergy",
            desc: "Specialized diagnostic tests and long-term treatment plans for children suffering from complex allergies.",
            list: [
                "• Skin prick testing (same day results)",
                "• Food allergy management",
                "• Eczema and skin condition treatment",
                "• Asthma and hay fever care"
            ],
            btn: "Book this appointment"
        }
    },
    conditions: {
        title: "Treated Conditions",
        subtitle: "Dr. Manolova provides expert assessment and management of a wide range of pediatric conditions - from common childhood illnesses to complex chronic diseases.",
        respiratory: { title: "Respiratory", list: ["• Asthma & Wheezing", "• Chronic Cough", "• Chest Infections"] },
        gastro: { title: "Gastrointestinal", list: ["• Reflux & Vomiting", "• Abdominal Pain", "• Constipation"] },
        allergy: { title: "Allergic", list: ["• Food Allergies", "• Eczema", "• Hay Fever"] },
        neonatal: { title: "Neonatal", list: ["• Colic & Feeding Support", "• Jaundice Monitoring", "• Newborn Growth"] },
        general: { title: "General Health", list: ["• High Fever", "• Growth Issues", "• Bedwetting"] }
    },
    resources: {
        title: "Knowledge Base",
        subtitle: "Expert medical insights and practical advice for parents, prepared by Dr. Manolova.",
        latest: "LATEST RESOURCES",
        readArticle: "READ ARTICLE →",
        faq: {
            title: "FREQUENTLY ASKED QUESTIONS",
            items: [
                { q: "How do I book an emergency appointment?", a: "Emergency slots are released daily at 08:30. Please call our clinic directly." },
                { q: "Do you offer telemedicine?", a: "Yes, for follow-ups and general advice we offer secure video consultations." },
                { q: "Do you accept private insurance?", a: "We work with most major UK insurers including Bupa, AXA and Vitality." }
            ]
        },
        cta: {
            title: "Need advice?",
            text: "Send a direct inquiry to our clinical team.",
            btn: "CONTACT US"
        },
        // Leaving article content static/mixed as they are links to external BG media mostly.
        // Titles could be translated but links are to BG sites.
        // I will translate titles to EN for the EN version.
        articles: [
            {
                title: "Pediatrics doesn't fit in textbooks, it is lived",
                category: "INTERVIEW • 2025",
                excerpt: "Deep philosophical and practical interview for 'Pediatrics Plus' magazine regarding the calling and challenges in modern child care."
            },
            {
                title: "Humanity and art in pediatrics",
                category: "INITIATIVE • 2024",
                excerpt: "Report on the project to transform the children's ward in Pazardzhik with the participation of local students and public figures."
            },
            {
                title: "The biggest motivation is the children",
                category: "VISION • 2024",
                excerpt: "Dr. Manolova on her ambitions to completely renovate the look of pediatric care and the role of modern diagnostics."
            },
            {
                title: "Appointment as Head of Second Department",
                category: "CAREER • 2023",
                excerpt: "Official announcement of taking the leadership post in one of the busiest pediatric departments in the country."
            },
            {
                title: "Nomination 'You are our future'",
                category: "RECOGNITION • 2023",
                excerpt: "Prestigious distinction from the Bulgarian Medical Association for contribution to the future of medicine in Bulgaria."
            }
        ]
    },
    auth: {
        login: {
            title: "Login",
            email: "EMAIL ADDRESS",
            password: "PASSWORD",
            btn: "Login",
            noAccount: "Don't have an account?",
            registerLink: "Sign up"
        },
        register: {
            title: "Registration",
            name: "FULL NAME",
            email: "EMAIL ADDRESS",
            phone: "PHONE (OPTIONAL)",
            password: "PASSWORD",
            btn: "Create Account",
            hasAccount: "Already have an account?",
            loginLink: "Login here",
            loading: "Registering..."
        }
    },
    myAppointments: {
        title: "My Appointments",
        empthy: "You have no upcoming appointments.",
        confirmed: "CONFIRMED",
        cancelled: "CANCELLED",
        download: "CALENDAR",
        cancel: "CANCEL",
        cancelConfirm: "Are you sure you want to cancel this appointment?",
        cancelSuccess: "Appointment cancelled successfully.",
        cancelError: "Cancellation failed.",
        cancelRestriction: "Appointments can only be cancelled at least 24 hours in advance."
    },
    userMenu: {
        login: "LOGIN",
        dashboard: "DASHBOARD",
        appointments: "APPOINTMENTS",
        logout: "LOGOUT"
    },
    successPage: {
        title: "Booking Successful!",
        message: "Thank you for your booking. You will receive a confirmation email shortly.",
        viewAppointments: "View Appointments",
        home: "Home"
    }
};

export const bg: Dictionary = {
    header: {
        utility: "Специализирана педиатрична помощ в Пловдив",
        ageGroup: "Възраст 0-18 години",
        title: "Д-р Златомира Манолова",
        subtitle: "ПЕДИАТЪР СПЕЦИАЛИСТ",
        nav: {
            home: "НАЧАЛО",
            services: "УСЛУГИ",
            conditions: "ЗАБОЛЯВАНИЯ",
            resources: "РЕСУРСИ",
            book: "ЗАПАЗЕТЕ ЧАС",
            contact: "КОНТАКТИ",
        },
        switchTitle: "Switch to English"
    },
    footer: {
        title: "Педиатрия Манолова",
        desc: "Предоставяне на експертна и състрадателна педиатрична помощ за деца от всички възрасти. Базирана в сърцето на Лондон.",
        links: "БЪРЗИ ВРЪЗКИ",
        location: "МЕСТОПОЛОЖЕНИЕ",
        medicalCenter: "Медицински център",
        partnerHospital: "Партньорска болница",
        hours: "РАБОТНО ВРЕМЕ",
        hoursDetails: {
            weekdays: "Пн - Пт: 09:00 - 18:00",
            saturday: "Сб: 10:00 - 14:00",
            sunday: "Нд: Само спешни случаи"
        },
        rights: "Д-р Златомира Манолова. Всички права запазени.",
        privacy: "Политика за поверителност",
        terms: "Условия за ползване"
    },
    home: {
        hero: {
            title: "Елитна медицинска помощ",
            titleHighlight: "Посветена на децата.",
            subtitle: "Осигуряване на най-високия стандарт на педиатричен опит в сърцето на Пловдив, съчетаващ клинични постижения с дълбока състрадателна грижа.",
            bookBtn: "Запазете консултация",
            servicesBtn: "Вижте услугите",
        },
        trust: {
            reviews: "ПРОВЕРЕНИ ОТЗИВА",
            partners: "ПАРТНЬОРСТВО С ВОДЕЩИ КЛИНИКИ",
        },
        services: {
            title: "Клиничен опит",
            subtitle: "От рутинни прегледи до специализирани диагностични клиники, ние предоставяме пълен спектър от педиатрични грижи.",
            general: {
                title: "Обща педиатрия",
                desc: "Експертно управление на остри детски заболявания, рутинни здравни прегледи и клинични ваксинации.",
                btn: "ВИЖТЕ УСЛУГАТА →"
            },
            allergy: {
                title: "Алергия и астма",
                desc: "Специализирано диагностично тестване и дългосрочни планове за лечение на комплексни детски алергии.",
                btn: "ВИЖТЕ УСЛУГАТА →"
            },
            newborn: {
                title: "Грижа за новородени",
                desc: "Специализирана подкрепа за здравето на новородените, проблеми с храненето и ранен преглед на развитието.",
                btn: "ВИЖТЕ УСЛУГАТА →"
            }
        },
        about: {
            badge: "УТВЪРДЕН ПЕДИАТЪР",
            name: "Д-р Златомира Манолова-Пенева",
            role: "Началник на Второ педиатрично отделение",
            bio1: "Д-р Златомира Манолова-Пенева завършва Медицински университет – Пловдив през 2018 г., а през 2023 г. придобива специалност по педиатрия. Още в началото на професионалния си път тя насочва интересите си към детското здравеопазване, като се стреми към задълбочено практическо и теоретично обучение.",
            bio2: "Специализацията си започва във Второ педиатрично отделение с интензивен сектор към МБАЛ – Пазарджик, където натрупва ценен клиничен опит. В рамките на обучението си преминава и през Клиниката по педиатрия на УМБАЛ „Св. Георги“ – Пловдив, което допринася за разширяване на професионалната ѝ подготовка и клиничен поглед.",
            bio3: "След успешно завършване на специализацията д-р Манолова-Пенева продължава професионалното си развитие като лекар-специалист в МБАЛ – Пазарджик, като паралелно с това става част от екипа на Денонощна детска поликлиника „Пловдимед“ в Пловдив. Работата ѝ е насочена към осигуряване на качествена и навременна медицинска грижа за деца от различни възрастови групи.",
            bio4: "През 2025 г. тя заема ръководна позиция като началник на отделение – първоначално като временно изпълняващ длъжността, а впоследствие, след успешно проведен конкурс, и като титулярен началник. Професионализмът, отговорността и отдадеността ѝ към пациентите и екипа са високо оценени, като през 2023 г. е номинирана от Българския лекарски съюз в категорията „Ти си нашето бъдеще“.",
            qualifications: "КВАЛИФИКАЦИИ",
            qualList: ["• MBBS Медицинска степен", "• DCH Диплома по детско здраве", "• MRCPCH Член на RCPCH", "• FRCPCH Член на RCPCH"],
            specialties: "СПЕЦИАЛНОСТИ",
            specList: ["• Педиатрична алергология", "• Ранно детско развитие", "• Спешни състояния", "• Неонатологични консултации"],
            bioBtn: "Поискайте пълна биография",
            imageAlt: "Д-р Манолова Специалист"
        },
        heroImageAlt: "Клинична консултация с д-р Манолова",
        partnerImageAlt: "Лога на партньорски болници"
    },
    booking: {
        title: "Онлайн записване на час",
        subtitle: "Запазете вашата консултация с д-р Манолова в няколко лесни стъпки.",
        step1: "1. Изберете услуга",
        step2: "2. Изберете дата",
        step3: "3. Свободни часове",
        services: {
            standard: "Стандартен преглед",
            specialized: "Специализирана консултация"
        },
        confirm: {
            title: "Потвърдете час",
            text: "Потвърдете %s за %s?",
            btn: "ПОТВЪРДИ ЧАС",
            loading: "ЗАПАЗВАНЕ..."
        },
        taken: "ЗАЕТО",
        success: "Успешна резервация!",
        error: "Резервацията не бе успешна."
    },
    contact: {
        title: "Запишете час",
        subtitle: "Свържете се с д-р Манолова за експертна педиатрична грижа и клинична диагностика.",
        clinics: "Нашите клиники",
        medicalCenter: "Медицински център",
        partnerHospital: "Партньорска болница",
        tel: "Тел",
        email: "Имейл",
        admin: {
            title: "Администрация и плащания",
            text: "За административни въпроси или такива, свързани с плащания, моля свържете се с централния ни офис между 09:00 - 17:00 ч."
        },
        form: {
            title: "Форма за запитване",
            name: "ПЪЛНО ИМЕ",
            email: "ИМЕЙЛ АДРЕС",
            msg: "СЪОБЩЕНИЕ",
            btn: "ИЗПРАТЕТЕ ЗАПИТВАНЕ"
        }
    },
    servicesPage: {
        title: "Нашите педиатрични услуги",
        subtitle: "Предоставяме пълен спектър от педиатрични грижи - от рутинни профилактични прегледи до специализирани диагностични клиники.",
        general: {
            title: "Обща педиатрия",
            desc: "Осигуряваме цялостни здравни прегледи за деца от всички възрасти, гарантирайки, че тяхното израстване и развитие са в норма.",
            list: [
                "• Цялостни здравни оценки",
                "• Рутинни ваксинации и имунизации",
                "• Лечение на остри детски заболявания",
                "• Консултации за растеж и хранене"
            ],
            btn: "Запазете този час"
        },
        allergy: {
            title: "Детска алергология",
            desc: "Специализирани диагностични тестове и дългосрочни планове за лечение на деца, страдащи от комплексни алергии.",
            list: [
                "• Кожно-алергични тестове (резултати в същия ден)",
                "• Управление на хранителни алергии",
                "• Лечение на екзема и кожни състояния",
                "• Грижа при астма и сенна хрема"
            ],
            btn: "Запазете този час"
        }
    },
    conditions: {
        title: "Лекувани състояния",
        subtitle: "Д-р Манолова предоставя експертна оценка и управление на широк спектър от педиатрични състояния - от обичайни детски болести до комплексни хронични заболявания.",
        respiratory: { title: "Респираторни", list: ["• Астма и хрипове", "• Хронична кашлица", "• Гръдни инфекции"] },
        gastro: { title: "Гастроинтестинални", list: ["• Рефлукс и повръщане", "• Коремна болка", "• Запек"] },
        allergy: { title: "Алергични", list: ["• Хранителни алергии", "• Екзема", "• Сенна хрема"] },
        neonatal: { title: "Неонатални", list: ["• Колики и подкрепа при хранене", "• Мониторинг на жълтеница", "• Растеж на новороденото"] },
        general: { title: "Общо здраве", list: ["• Висока температура", "• Проблеми с растежа", "• Нощно напикаване"] }
    },
    resources: {
        title: "База знания",
        subtitle: "Експертни медицински прозрения и практически съвети за родители, подготвени от д-р Манолова.",
        latest: "ПОСЛЕДНИ РЕСУРСИ",
        readArticle: "ПРОЧЕТЕТЕ СТАТИЯТА →",
        faq: {
            title: "ЧЕСТО ЗАДАВАНИ ВЪПРОСИ",
            items: [
                { q: "Как да запазя час за спешен преглед?", a: "Свободните часове за спешни случаи се обявяват всеки ден в 08:30 ч. Моля, обадете се директно в нашата клиника." },
                { q: "Предлагате ли телемедицински консултации?", a: "Да, за последващи прегледи и общи съвети предлагаме сигурни видео консултации." },
                { q: "Клиниката работи ли с частни застраховки?", a: "Работим с повечето големи застрахователи в Обединеното кралство, включително Bupa, AXA и Vitality." }
            ]
        },
        cta: {
            title: "Нуждаете се от съвет?",
            text: "Изпратете директно запитване към нашия клиничен екип.",
            btn: "СВЪРЖЕТЕ СЕ С НАС"
        },
        articles: [
            {
                title: "Педиатрията не се побира в учебници, тя се живее",
                category: "ИНТЕРВЮ • 2025",
                excerpt: "Дълбоко философско и практическо интервю за списание 'Педиатрия плюс' относно призванието и предизвикателствата в съвременната грижа за децата."
            },
            {
                title: "Хуманност и изкуство в педиатрията",
                category: "ИНИЦИАТИВА • 2024",
                excerpt: "Репортаж за проекта по преобразяване на детското отделение в Пазарджик с участието на местни ученици и общественици."
            },
            {
                title: "Най-голямата мотивация са децата",
                category: "ВИЗИЯ • 2024",
                excerpt: "Д-р Манолова за амбициите си да обнови изцяло облика на педиатричната помощ и ролята на модерната диагностика."
            },
            {
                title: "Назначение за Началник на Второ отделение",
                category: "КАРИЕРА • 2023",
                excerpt: "Официално съобщение за поемането на ръководния пост в едно от най-натоварените педиатрични отделения в страната."
            },
            {
                title: "Номинация 'Ти си нашето бъдеще'",
                category: "ПРИЗНАНИЕ • 2023",
                excerpt: "Престижно отличие от Българския лекарски съюз за принос към бъдещето на медицината в България."
            }
        ]
    },
    auth: {
        login: {
            title: "Вход",
            email: "ИМЕЙЛ АДРЕС",
            password: "ПАРОЛА",
            btn: "Вход",
            noAccount: "Нямате профил?",
            registerLink: "Регистрирайте се"
        },
        register: {
            title: "Регистрация",
            name: "ПЪЛНО ИМЕ",
            email: "ИМЕЙЛ АДРЕС",
            phone: "ТЕЛЕФОН (ОПЦИОНАЛНО)",
            password: "ПАРОЛА",
            btn: "Създай профил",
            hasAccount: "Вече имате профил?",
            loginLink: "Влезте тук",
            loading: "Регистриране..."
        }
    },
    myAppointments: {
        title: "Моите часове",
        empthy: "Нямате предстоящи часове.",
        confirmed: "ПОТВЪРДЕН",
        cancelled: "ОТМЕНЕН",
        download: "КАЛЕНДАР",
        cancel: "ОТМЕНИ",
        cancelConfirm: "Сигурни ли сте, че искате да отмените този час?",
        cancelSuccess: "Часът бе отменен успешно.",
        cancelError: "Отмяната не бе успешна.",
        cancelRestriction: "Часовете могат да бъдат отменяни най-малко 24 часа предварително."
    },
    userMenu: {
        login: "ВХОД",
        dashboard: "ТАБЛО",
        appointments: "ЧАСОВЕ",
        logout: "ИЗХОД"
    },
    successPage: {
        title: "Часът е запазен успешно!",
        message: "Благодарим ви за резервацията. Скоро ще получите потвърждение по имейл.",
        viewAppointments: "Вижте часовете",
        home: "Начало"
    }
};
