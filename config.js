// Всё, что меняется под другого риэлтора — в этом файле. Цены в тенге.
window.REALTOR = {
  firstName: 'Айжан',
  fullName: 'Айжан Шалқарқызы',
  age: 21,
  experience: 3,
  families: '100+',
  city: 'Астана',
  agency: 'Панорама Group',
  accent: '#ff7a2f',
  currency: '₸',

  // Контакты: телефон в формате 77001234567 (без +), instagram — логин без @
  phone: '77088527153',
  phoneLabel: '+7 708 852 71 53',
  instagram: 'aizhannss_',
  whatsappText: 'Здравствуйте, Айжан! Пишу с вашего сайта.',

  photos: {
    hero: 'assets/aizhan-1.jpg',   // крупный портрет
    second: 'assets/aizhan-2.jpg'  // фото в полный рост
  },

  // Объекты в продаже. Фото и ссылка — обязательны. Всё карточка кликабельна.
  listings: [
    {
      title: '3-комнатная квартира',
      district: 'ЖК «Название», Есильский р-н',
      rooms: 3, area: 98, floor: '7/12',
      price: 89000000,
      tag: 'НОВИНКА',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80',
      url: 'https://krisha.kz/'
    },
    {
      title: '2-комнатная квартира',
      district: 'ЖК «Название», р-н Нура',
      rooms: 2, area: 64, floor: '4/9',
      price: 52500000,
      tag: '',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1400&q=80',
      url: 'https://krisha.kz/'
    },
    {
      title: '1-комнатная квартира',
      district: 'ЖК «Название», р-н Сарыарка',
      rooms: 1, area: 42, floor: '10/16',
      price: 34900000,
      tag: 'ВЫГОДНО',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&q=80',
      url: 'https://krisha.kz/'
    }
  ]
};
