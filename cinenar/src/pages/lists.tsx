import React, { useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import TopHeaderBar from '../components/TopHeaderBar';
import BottomNavBar from '../components/BottomNavBar';
import MovieDetailModal from '../components/MovieDetailModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { searchMovies } from '../services/tmdb';
import styles from './lists.module.css';

// Film listesi verileri
const filmListeleri = {
  "filmListeleri": [
    {
      "listeAdi": "IMDb Top 10 Efsanesi",
      "aciklama": "Tüm zamanların en yüksek puanlı, izleyici tarafından baş tacı edilmiş filmleri.",
      "filmSayisi": 10,
      "filmler": [
        {
          "sira": 1,
          "filmAdi": "The Shawshank Redemption",
          "yil": 1994,
          "yonetmen": "Frank Darabont",
          "imdbPuani": 9.3,
          "kisaAciklama": "Umut, dostluk ve hayatta kalma üzerine zamansız bir başyapıt."
        },
        {
          "sira": 2,
          "filmAdi": "The Godfather",
          "yil": 1972,
          "yonetmen": "Francis Ford Coppola",
          "imdbPuani": 9.2,
          "kisaAciklama": "Bir suç ailesinin epik öyküsü ve sinema tarihinin en etkili gangster filmi."
        },
        {
          "sira": 3,
          "filmAdi": "The Dark Knight",
          "yil": 2008,
          "yonetmen": "Christopher Nolan",
          "imdbPuani": 9.0,
          "kisaAciklama": "Süper kahraman türünü yeniden tanımlayan, anarşi ve düzen üzerine karanlık bir masal."
        },
        {
          "sira": 4,
          "filmAdi": "12 Angry Men",
          "yil": 1957,
          "yonetmen": "Sidney Lumet",
          "imdbPuani": 9.0,
          "kisaAciklama": "Tek bir odada geçen, adalet ve önyargı kavramlarını sorgulatan bir mahkeme draması."
        },
        {
          "sira": 5,
          "filmAdi": "Schindler's List",
          "yil": 1993,
          "yonetmen": "Steven Spielberg",
          "imdbPuani": 8.9,
          "kisaAciklama": "İnsanlığın en karanlık anlarında bile iyiliğin nasıl parlayabildiğini gösteren dokunaklı bir yapım."
        },
        {
          "sira": 6,
          "filmAdi": "The Lord of the Rings: The Return of the King",
          "yil": 2003,
          "yonetmen": "Peter Jackson",
          "imdbPuani": 8.9,
          "kisaAciklama": "Bir fantastik destanın görkemli ve tatmin edici finali."
        },
        {
          "sira": 7,
          "filmAdi": "Pulp Fiction",
          "yil": 1994,
          "yonetmen": "Quentin Tarantino",
          "imdbPuani": 8.9,
          "kisaAciklama": "Doğrusal olmayan anlatımı ve unutulmaz diyaloglarıyla modern sinemayı etkileyen bir kült film."
        },
        {
          "sira": 8,
          "filmAdi": "Forrest Gump",
          "yil": 1994,
          "yonetmen": "Robert Zemeckis",
          "imdbPuani": 8.8,
          "kisaAciklama": "20. yüzyıl Amerikan tarihine saf bir kalple tanıklık eden bir adamın hayat yolculuğu."
        },
        {
          "sira": 9,
          "filmAdi": "Fight Club",
          "yil": 1999,
          "yonetmen": "David Fincher",
          "imdbPuani": 8.8,
          "kisaAciklama": "Tüketim kültürüne ve modern insanın yabancılaşmasına sert bir eleştiri."
        },
        {
          "sira": 10,
          "filmAdi": "Inception",
          "yil": 2010,
          "yonetmen": "Christopher Nolan",
          "imdbPuani": 8.8,
          "kisaAciklama": "Rüyaların katmanlı dünyasında geçen, akıl almaz bir soygun hikayesi."
        }
      ]
    },
    {
      "listeAdi": "Son 10 Yılın En İyi Film Oscar Kazananları",
      "aciklama": "Akademi tarafından 'En İyi Film' ödülüne layık görülen modern klasiklerin geçidi.",
      "filmSayisi": 11,
      "filmler": [
        {
          "sira": 1,
          "filmAdi": "Oppenheimer",
          "yil": 2023,
          "yonetmen": "Christopher Nolan",
          "kazandigiYil": 2024,
          "kisaAciklama": "Atom bombasının babasının karmaşık ve çelişkili portresi, görsel bir şölenle sunuluyor."
        },
        {
          "sira": 2,
          "filmAdi": "Everything Everywhere All at Once",
          "yil": 2022,
          "yonetmen": "Daniel Kwan, Daniel Scheinert",
          "kazandigiYil": 2023,
          "kisaAciklama": "Paralel evrenlerde geçen, aksiyon dolu, komik ve dokunaklı bir aile hikayesi."
        },
        {
          "sira": 3,
          "filmAdi": "CODA",
          "yil": 2021,
          "yonetmen": "Sian Heder",
          "kazandigiYil": 2022,
          "kisaAciklama": "İşitme engelli bir ailenin işiten tek üyesinin hayallerinin peşinden gitme mücadelesi."
        },
        {
          "sira": 4,
          "filmAdi": "Nomadland",
          "yil": 2020,
          "yonetmen": "Chloé Zhao",
          "kazandigiYil": 2021,
          "kisaAciklama": "Modern Amerika'da karavanıyla göçebe bir hayat süren bir kadının dokunaklı öyküsü."
        },
        {
          "sira": 5,
          "filmAdi": "Parasite",
          "yil": 2019,
          "yonetmen": "Bong Joon Ho",
          "kazandigiYil": 2020,
          "kisaAciklama": "Sınıf çatışmasını kara mizah ve gerilimle harmanlayan Güney Kore sinemasından bir başyapıt."
        },
        {
          "sira": 6,
          "filmAdi": "Green Book",
          "yil": 2018,
          "yonetmen": "Peter Farrelly",
          "kazandigiYil": 2019,
          "kisaAciklama": "Irkçılığın hüküm sürdüğü yıllarda siyahi bir piyanist ile İtalyan-Amerikan şoförünün dostluğu."
        },
        {
          "sira": 7,
          "filmAdi": "The Shape of Water",
          "yil": 2017,
          "yonetmen": "Guillermo del Toro",
          "kazandigiYil": 2018,
          "kisaAciklama": "Soğuk Savaş döneminde geçen, yalnız bir kadının ve suda yaşayan bir yaratığın fantastik aşk hikayesi."
        },
        {
          "sira": 8,
          "filmAdi": "Moonlight",
          "yil": 2016,
          "yonetmen": "Barry Jenkins",
          "kazandigiYil": 2017,
          "kisaAciklama": "Genç bir siyahi adamın çocukluğundan yetişkinliğine kimliğini ve yerini bulma arayışı."
        },
        {
          "sira": 9,
          "filmAdi": "Spotlight",
          "yil": 2015,
          "yonetmen": "Tom McCarthy",
          "kazandigiYil": 2016,
          "kisaAciklama": "Katolik Kilisesi'ndeki taciz skandalını ortaya çıkaran gazetecilerin gerçek hikayesi."
        },
        {
          "sira": 10,
          "filmAdi": "Birdman",
          "yil": 2014,
          "yonetmen": "Alejandro G. Iñárritu",
          "kazandigiYil": 2015,
          "kisaAciklama": "Tek planda çekilmiş gibi görünen, eski bir süper kahraman aktörünün geri dönüş çabası."
        },
        {
          "sira": 11,
          "filmAdi": "12 Years a Slave",
          "yil": 2013,
          "yonetmen": "Steve McQueen",
          "kazandigiYil": 2014,
          "kisaAciklama": "Özgür bir adamken kaçırılıp köle olarak satılan Solomon Northup'un sarsıcı gerçek hikayesi."
        }
      ]
    },
    {
      "listeAdi": "Kafa Yakan Bilim Kurgu Filmleri",
      "aciklama": "Gerçekliği sorgulatan, zihin açan ve izleyiciyi düşünmeye iten modern bilim kurgu klasikleri.",
      "filmSayisi": 10,
      "filmler": [
        {
          "sira": 1,
          "filmAdi": "Arrival",
          "yil": 2016,
          "yonetmen": "Denis Villeneuve",
          "imdbPuani": 7.9,
          "kisaAciklama": "Dilbilimin ve zaman algısının sınırlarını zorlayan, duygusal ve zeki bir ilk temas hikayesi."
        },
        {
          "sira": 2,
          "filmAdi": "Blade Runner 2049",
          "yil": 2017,
          "yonetmen": "Denis Villeneuve",
          "imdbPuani": 8.0,
          "kisaAciklama": "Orijinal filmin mirasını taşıyan, görsel olarak büyüleyici bir neo-noir ve varoluşsal bir sorgulama."
        },
        {
          "sira": 3,
          "filmAdi": "Interstellar",
          "yil": 2014,
          "yonetmen": "Christopher Nolan",
          "imdbPuani": 8.6,
          "kisaAciklama": "İnsanlığın geleceği için uzayın derinliklerine yapılan, bilim ve sevgi dolu bir yolculuk."
        },
        {
          "sira": 4,
          "filmAdi": "Ex Machina",
          "yil": 2014,
          "yonetmen": "Alex Garland",
          "imdbPuani": 7.7,
          "kisaAciklama": "Yapay zekanın bilinç ve manipülasyon yeteneklerini sorgulatan klostrofobik bir gerilim."
        },
        {
          "sira": 5,
          "filmAdi": "Her",
          "yil": 2013,
          "yonetmen": "Spike Jonze",
          "imdbPuani": 8.0,
          "kisaAciklama": "Yalnız bir adamın bir işletim sistemine aşık olmasını anlatan, teknoloji ve ilişkilere dair melankolik bir bakış."
        },
        {
          "sira": 6,
          "filmAdi": "District 9",
          "yil": 2009,
          "yonetmen": "Neill Blomkamp",
          "imdbPuani": 7.9,
          "kisaAciklama": "Apartheid ve yabancı düşmanlığına dair güçlü bir alegori sunan, belgesel tarzında bir bilim kurgu."
        },
        {
          "sira": 7,
          "filmAdi": "Children of Men",
          "yil": 2006,
          "yonetmen": "Alfonso Cuarón",
          "imdbPuani": 7.9,
          "kisaAciklama": "İnsanlığın soyunun tükendiği bir dünyada, umudun peşindeki nefes kesen bir kaçış öyküsü."
        },
        {
          "sira": 8,
          "filmAdi": "Dune: Part One & Two",
          "yil": "2021 & 2024",
          "yonetmen": "Denis Villeneuve",
          "imdbPuani": 8.0,
          "kisaAciklama": "Frank Herbert'in kült romanından uyarlanan, epik ölçekte ve görsel olarak baş döndürücü bir destan."
        },
        {
          "sira": 9,
          "filmAdi": "Source Code",
          "yil": 2011,
          "yonetmen": "Duncan Jones",
          "imdbPuani": 7.5,
          "kisaAciklama": "Bir askerin, bir tren patlamasını önlemek için sürekli olarak 8 dakikayı yeniden yaşadığı tempolu bir gerilim."
        },
        {
          "sira": 10,
          "filmAdi": "Annihilation",
          "yil": 2018,
          "yonetmen": "Alex Garland",
          "imdbPuani": 6.8,
          "kisaAciklama": "Gizemli bir bölgeye giren bir grup bilim insanının karşılaştığı, hem güzel hem de korkutucu olaylar."
        }
      ]
    },
    {
      "listeAdi": "Ters Köşe Yapan Psikolojik Gerilimler",
      "aciklama": "Sonuna kadar merak içinde bırakacak, şaşırtıcı finalleriyle hafızalara kazınan filmler.",
      "filmSayisi": 10,
      "filmler": [
        {
          "sira": 1,
          "filmAdi": "The Prestige",
          "yil": 2006,
          "yonetmen": "Christopher Nolan",
          "imdbPuani": 8.5,
          "kisaAciklama": "İki sihirbazın takıntıya dönüşen rekabetini anlatan, zekice kurgulanmış bir hikaye."
        },
        {
          "sira": 2,
          "filmAdi": "Shutter Island",
          "yil": 2010,
          "yonetmen": "Martin Scorsese",
          "imdbPuani": 8.2,
          "kisaAciklama": "Bir akıl hastanesindeki kayıp vakasını araştıran dedektifin giderek kendi akıl sağlığını sorgulaması."
        },
        {
          "sira": 3,
          "filmAdi": "The Sixth Sense",
          "yil": 1999,
          "yonetmen": "M. Night Shyamalan",
          "imdbPuani": 8.2,
          "kisaAciklama": "Sinema tarihinin en ikonik finaline sahip, ölüleri gören bir çocuk ve psikoloğunun hikayesi."
        },
        {
          "sira": 4,
          "filmAdi": "Oldeuboi (Oldboy)",
          "yil": 2003,
          "yonetmen": "Park Chan-wook",
          "imdbPuani": 8.4,
          "kisaAciklama": "15 yıl sebepsizce hapsedilen bir adamın intikam arayışını anlatan, şok edici ve stilize bir film."
        },
        {
          "sira": 5,
          "filmAdi": "The Usual Suspects",
          "yil": 1995,
          "yonetmen": "Bryan Singer",
          "imdbPuani": 8.5,
          "kisaAciklama": "Polise ifade veren bir dolandırıcının anlattığı karmaşık soygun hikayesi ve efsanevi finali."
        },
        {
          "sira": 6,
          "filmAdi": "Memento",
          "yil": 2000,
          "yonetmen": "Christopher Nolan",
          "imdbPuani": 8.4,
          "kisaAciklama": "Kısa süreli hafıza kaybı yaşayan bir adamın, karısının katilini bulma çabasını tersten anlatan bir yapım."
        },
        {
          "sira": 7,
          "filmAdi": "Gone Girl",
          "yil": 2014,
          "yonetmen": "David Fincher",
          "imdbPuani": 8.1,
          "kisaAciklama": "Karısı aniden ortadan kaybolan bir adamın, medyanın ve polisin hedefi haline gelmesini konu alan bir gerilim."
        },
        {
          "sira": 8,
          "filmAdi": "Prisoners",
          "yil": 2013,
          "yonetmen": "Denis Villeneuve",
          "imdbPuani": 8.1,
          "kisaAciklama": "Kızı kaçırılan bir babanın, adaleti kendi sağlamaya çalışmasını anlatan karanlık ve sürükleyici bir film."
        },
        {
          "sira": 9,
          "filmAdi": "Se7en",
          "yil": 1995,
          "yonetmen": "David Fincher",
          "imdbPuani": 8.6,
          "kisaAciklama": "Yedi ölümcül günahı temel alan bir dizi cinayeti araştıran iki dedektifin kasvetli hikayesi."
        },
        {
          "sira": 10,
          "filmAdi": "The Handmaiden",
          "yil": 2016,
          "yonetmen": "Park Chan-wook",
          "imdbPuani": 8.1,
          "kisaAciklama": "Japon işgali altındaki Kore'de geçen, aldatma ve tutku dolu, katmanlı bir intikam öyküsü."
        }
      ]
    },
    {
      "listeAdi": "Quentin Tarantino Filmografisi",
      "aciklama": "Diyalogları, müzik seçimleri ve şiddeti stilize kullanımıyla tanınan efsane yönetmenin en iyileri.",
      "filmSayisi": 10,
      "filmler": [
        { "sira": 1, "filmAdi": "Pulp Fiction", "yil": 1994 },
        { "sira": 2, "filmAdi": "Reservoir Dogs", "yil": 1992 },
        { "sira": 3, "filmAdi": "Inglourious Basterds", "yil": 2009 },
        { "sira": 4, "filmAdi": "Django Unchained", "yil": 2012 },
        { "sira": 5, "filmAdi": "Kill Bill: Vol. 1", "yil": 2003 },
        { "sira": 6, "filmAdi": "Once Upon a Time in Hollywood", "yil": 2019 },
        { "sira": 7, "filmAdi": "The Hateful Eight", "yil": 2015 },
        { "sira": 8, "filmAdi": "Jackie Brown", "yil": 1997 },
        { "sira": 9, "filmAdi": "Kill Bill: Vol. 2", "yil": 2004 },
        { "sira": 10, "filmAdi": "Death Proof", "yil": 2007 }
      ]
    },
    {
      "listeAdi": "Çocuklar İçin Olmayan Animasyon Başyapıtları",
      "aciklama": "Animasyonun sadece bir tür değil, her türlü hikayeyi anlatabilecek bir sanat formu olduğunu kanıtlayan filmler.",
      "filmSayisi": 11,
      "filmler": [
        {
          "sira": 1,
          "filmAdi": "Spirited Away",
          "yil": 2001,
          "yonetmen": "Hayao Miyazaki",
          "kisaAciklama": "Ruhların dünyasında kaybolan bir kızın büyüme hikayesini anlatan, Oscar ödüllü bir fantezi."
        },
        {
          "sira": 2,
          "filmAdi": "Spider-Man: Into the Spider-Verse",
          "yil": 2018,
          "yonetmen": "Bob Persichetti, Peter Ramsey, Rodney Rothman",
          "kisaAciklama": "Çizgi roman estetiğini sinemaya taşıyan, görsel olarak devrim niteliğinde bir süper kahraman filmi."
        },
        {
          "sira": 3,
          "filmAdi": "Grave of the Fireflies",
          "yil": 1988,
          "yonetmen": "Isao Takahata",
          "kisaAciklama": "2. Dünya Savaşı'nın sonlarında hayatta kalmaya çalışan iki kardeşin yürek burkan dramı."
        },
        {
          "sira": 4,
          "filmAdi": "Princess Mononoke",
          "yil": 1997,
          "yonetmen": "Hayao Miyazaki",
          "kisaAciklama": "Doğa ve insanlık arasındaki savaşı konu alan, epik ve karmaşık bir macera."
        },
        {
          "sira": 5,
          "filmAdi": "Persepolis",
          "yil": 2007,
          "yonetmen": "Marjane Satrapi, Vincent Paronnaud",
          "kisaAciklama": "İran İslam Devrimi sırasında büyüyen bir kızın otobiyografik hikayesini anlatan dokunaklı bir yapım."
        },
        {
          "sira": 6,
          "filmAdi": "WALL-E",
          "yil": 2008,
          "yonetmen": "Andrew Stanton",
          "kisaAciklama": "Diyalogsuz ilk yarısıyla sinema dersi veren, çevre bilinci ve aşk üzerine bir Pixar klasiği."
        },
        {
          "sira": 7,
          "filmAdi": "Akira",
          "yil": 1988,
          "yonetmen": "Katsuhiro Otomo",
          "kisaAciklama": "Siberpunk türünün temel taşlarından olan, distopik bir gelecekte geçen bir aksiyon ve gizem filmi."
        },
        {
          "sira": 8,
          "filmAdi": "Perfect Blue",
          "yil": 1997,
          "yonetmen": "Satoshi Kon",
          "kisaAciklama": "Şöhret, kimlik ve gerçeklik algısının kayboluşunu anlatan gerilim dolu bir psikolojik anime."
        },
        {
          "sira": 9,
          "filmAdi": "Klaus",
          "yil": 2019,
          "yonetmen": "Sergio Pablos",
          "kisaAciklama": "Noel Baba efsanesine taze ve sıcak bir başlangıç hikayesi sunan, el çizimi estetiğiyle büyüleyen bir film."
        },
        {
          "sira": 10,
          "filmAdi": "I Lost My Body",
          "yil": 2019,
          "yonetmen": "Jérémy Clapin",
          "kisaAciklama": "Sahibini arayan kesik bir elin Paris'teki yolculuğunu anlatan, özgün ve melankolik bir Fransız animasyonu."
        },
        {
          "sira": 11,
          "filmAdi": "Your Name.",
          "yil": 2016,
          "yonetmen": "Makoto Shinkai",
          "kisaAciklama": "Bedenleri yer değiştiren iki gencin kader ve zamanla iç içe geçen romantik hikayesi."
        }
      ]
    },
    {
      "listeAdi": "Dünya Sinemasından Başyapıtlar",
      "aciklama": "Hollywood'un ötesine geçerek farklı kültürlerin ve yönetmenlerin sinema sanatına kattığı eşsiz eserler.",
      "filmSayisi": 12,
      "filmler": [
        { "sira": 1, "filmAdi": "Parasite", "yil": 2019, "ulke": "Güney Kore" },
        { "sira": 2, "filmAdi": "Cidade de Deus (City of God)", "yil": 2002, "ulke": "Brezilya" },
        { "sira": 3, "filmAdi": "La vita è bella (Life Is Beautiful)", "yil": 1997, "ulke": "İtalya" },
        { "sira": 4, "filmAdi": "Le Fabuleux Destin d'Amélie Poulain (Amélie)", "yil": 2001, "ulke": "Fransa" },
        { "sira": 5, "filmAdi": "Das Leben der Anderen (The Lives of Others)", "yil": 2006, "ulke": "Almanya" },
        { "sira": 6, "filmAdi": "Jodaeiye Nader az Simin (A Separation)", "yil": 2011, "ulke": "İran" },
        { "sira": 7, "filmAdi": "El secreto de sus ojos (The Secret in Their Eyes)", "yil": 2009, "ulke": "Arjantin" },
        { "sira": 8, "filmAdi": "Crouching Tiger, Hidden Dragon", "yil": 2000, "ulke": "Tayvan" },
        { "sira": 9, "filmAdi": "Roma", "yil": 2018, "ulke": "Meksika" },
        { "sira": 10, "filmAdi": "Jagten (The Hunt)", "yil": 2012, "ulke": "Danimarka" },
        { "sira": 11, "filmAdi": "Yip Man (Ip Man)", "yil": 2008, "ulke": "Hong Kong" },
        { "sira": 12, "filmAdi": "Kış Uykusu", "yil": 2014, "ulke": "Türkiye" }
      ]
    },
    {
      "listeAdi": "Coen Kardeşler'in Unutulmazları",
      "aciklama": "Kara mizahı, eksantrik karakterleri ve özgün senaryolarıyla tanınan yönetmen kardeşlerin en iyi işleri.",
      "filmSayisi": 10,
      "filmler": [
        { "sira": 1, "filmAdi": "No Country for Old Men", "yil": 2007 },
        { "sira": 2, "filmAdi": "Fargo", "yil": 1996 },
        { "sira": 3, "filmAdi": "The Big Lebowski", "yil": 1998 },
        { "sira": 4, "filmAdi": "O Brother, Where Art Thou?", "yil": 2000 },
        { "sira": 5, "filmAdi": "A Serious Man", "yil": 2009 },
        { "sira": 6, "filmAdi": "Inside Llewyn Davis", "yil": 2013 },
        { "sira": 7, "filmAdi": "Miller's Crossing", "yil": 1990 },
        { "sira": 8, "filmAdi": "Barton Fink", "yil": 1991 },
        { "sira": 9, "filmAdi": "True Grit", "yil": 2010 },
        { "sira": 10, "filmAdi": "Raising Arizona", "yil": 1987 }
      ]
    },
    {
      "listeAdi": "Gülmek Garanti: Modern Komedi Klasikleri",
      "aciklama": "Sadece güldürmekle kalmayan, zeki senaryoları ve unutulmaz karakterleriyle öne çıkan 21. yüzyıl komedileri.",
      "filmSayisi": 10,
      "filmler": [
        { "sira": 1, "filmAdi": "The Grand Budapest Hotel", "yil": 2014, "yonetmen": "Wes Anderson" },
        { "sira": 2, "filmAdi": "What We Do in the Shadows", "yil": 2014, "yonetmen": "Jemaine Clement, Taika Waititi" },
        { "sira": 3, "filmAdi": "Little Miss Sunshine", "yil": 2006, "yonetmen": "Jonathan Dayton, Valerie Faris" },
        { "sira": 4, "filmAdi": "Superbad", "yil": 2007, "yonetmen": "Greg Mottola" },
        { "sira": 5, "filmAdi": "Shaun of the Dead", "yil": 2004, "yonetmen": "Edgar Wright" },
        { "sira": 6, "filmAdi": "Borat", "yil": 2006, "yonetmen": "Larry Charles" },
        { "sira": 7, "filmAdi": "The Death of Stalin", "yil": 2017, "yonetmen": "Armando Iannucci" },
        { "sira": 8, "filmAdi": "Booksmart", "yil": 2019, "yonetmen": "Olivia Wilde" },
        { "sira": 9, "filmAdi": "Palm Springs", "yil": 2020, "yonetmen": "Max Barbakow" },
        { "sira": 10, "filmAdi": "Toni Erdmann", "yil": 2016, "yonetmen": "Maren Ade" }
      ]
    },
    {
      "listeAdi": "Epik Tarihi Dramalar",
      "aciklama": "Geçmişin büyük olaylarını ve kişiliklerini görkemli bir sinematografiyle canlandıran, sürükleyici filmler.",
      "filmSayisi": 10,
      "filmler": [
        { "sira": 1, "filmAdi": "Gladiator", "yil": 2000, "yonetmen": "Ridley Scott" },
        { "sira": 2, "filmAdi": "Schindler's List", "yil": 1993, "yonetmen": "Steven Spielberg" },
        { "sira": 3, "filmAdi": "Braveheart", "yil": 1995, "yonetmen": "Mel Gibson" },
        { "sira": 4, "filmAdi": "Lawrence of Arabia", "yil": 1962, "yonetmen": "David Lean" },
        { "sira": 5, "filmAdi": "The Last of the Mohicans", "yil": 1992, "yonetmen": "Michael Mann" },
        { "sira": 6, "filmAdi": "Master and Commander: The Far Side of the World", "yil": 2003, "yonetmen": "Peter Weir" },
        { "sira": 7, "filmAdi": "Kingdom of Heaven (Director's Cut)", "yil": 2005, "yonetmen": "Ridley Scott" },
        { "sira": 8, "filmAdi": "Downfall (Der Untergang)", "yil": 2004, "yonetmen": "Oliver Hirschbiegel" },
        { "sira": 9, "filmAdi": "1917", "yil": 2019, "yonetmen": "Sam Mendes" },
        { "sira": 10, "filmAdi": "The Pianist", "yil": 2002, "yonetmen": "Roman Polanski" }
      ]
    }
  ]
};

interface Film {
  sira: number;
  filmAdi: string;
  yil: number | string;
  yonetmen?: string;
  imdbPuani?: number;
  kisaAciklama?: string;
  kazandigiYil?: number;
  ulke?: string;
  tmdbId?: number;
  posterPath?: string;
}

interface Liste {
  listeAdi: string;
  aciklama: string;
  filmSayisi: number;
  filmler: Film[];
}

const Lists: React.FC = () => {
  const [selectedListe, setSelectedListe] = useState<Liste | null>(null);
  const [showListeDetail, setShowListeDetail] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [filmData, setFilmData] = useState<Map<string, { id: number; posterPath?: string }>>(new Map());
  const [loadingPoster, setLoadingPoster] = useState<{ [key: string]: boolean }>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Sayfa yüklendiğinde tüm listelerin poster verilerini yükle (OPTIMIZED)
  useEffect(() => {
    const loadAllPosters = async () => {
      setIsInitialLoading(true);
      const newFilmData = new Map(filmData);
      
      // Tüm filmleri topla
      const allFilms = (filmListeleri.filmListeleri as any[]).flatMap(liste => liste.filmler);
      const uniqueFilms = allFilms.filter((film: any, index: number, self: any[]) => 
        index === self.findIndex((f: any) => f.filmAdi === film.filmAdi)
      );
      
      // Cache'de olmayan filmleri filtrele
      const uncachedFilms = uniqueFilms.filter((film: any) => !newFilmData.has(film.filmAdi));
      
      if (uncachedFilms.length === 0) {
        console.log('All films already cached on initial load');
        setIsInitialLoading(false);
        return;
      }

      console.log(`Initial loading: ${uncachedFilms.length} unique films in parallel...`);
      
      // Paralel API çağrıları
      const searchPromises = uncachedFilms.map(async (film: any) => {
        try {
          const searchResults = await searchMovies(film.filmAdi);
          if (searchResults.length > 0) {
            const firstResult = searchResults[0];
            return {
              filmAdi: film.filmAdi,
              data: {
                id: firstResult.id,
                posterPath: firstResult.poster_path
              }
            };
          }
        } catch (error) {
          console.error(`Error finding movie ID for ${film.filmAdi}:`, error);
        }
        return null;
      });

      // Tüm sonuçları bekle
      const results = await Promise.all(searchPromises);
      
      // Sonuçları Map'e ekle
      results.forEach((result: any) => {
        if (result) {
          newFilmData.set(result.filmAdi, result.data);
        }
      });
      
      setFilmData(newFilmData);
      setIsInitialLoading(false);
      console.log(`Initial load completed: ${newFilmData.size} films cached`);
    };

    loadAllPosters();
  }, []);

  // Film adlarından TMDB ID'lerini bul (PARALEL)
  const findMovieIds = async (liste: Liste) => {
    const newFilmData = new Map(filmData);
    
    // Sadece cache'de olmayan filmleri filtrele
    const uncachedFilms = liste.filmler.filter(film => !newFilmData.has(film.filmAdi));
    
    if (uncachedFilms.length === 0) {
      console.log('All films already cached');
      return;
    }

    console.log(`Loading ${uncachedFilms.length} films in parallel...`);
    
    // Paralel API çağrıları
    const searchPromises = uncachedFilms.map(async (film) => {
      try {
        const searchResults = await searchMovies(film.filmAdi);
        if (searchResults.length > 0) {
          const firstResult = searchResults[0];
          return {
            filmAdi: film.filmAdi,
            data: {
              id: firstResult.id,
              posterPath: firstResult.poster_path
            }
          };
        }
      } catch (error) {
        console.error(`Error finding movie ID for ${film.filmAdi}:`, error);
      }
      return null;
    });

    // Tüm sonuçları bekle
    const results = await Promise.all(searchPromises);
    
    // Sonuçları Map'e ekle
    results.forEach(result => {
      if (result) {
        newFilmData.set(result.filmAdi, result.data);
      }
    });
    
    setFilmData(newFilmData);
    console.log(`Loaded ${results.filter(r => r !== null).length} films successfully`);
  };

  // Poster yüklenince skeleton'u kaldır
  const handlePosterLoad = (filmAdi: string) => {
    setLoadingPoster((prev) => ({ ...prev, [filmAdi]: false }));
  };

  // Liste kartı için poster seç
  const getListePoster = (liste: Liste) => {
    if (liste.filmler.length === 0) return null;
    
    // İlk filmden poster al
    const firstFilm = liste.filmler[0];
    const movieData = filmData.get(firstFilm.filmAdi);
    return movieData?.posterPath;
  };

  // Liste açıldığında loadingPoster'ı true yap
  const handleListeClick = async (liste: Liste) => {
    setSelectedListe(liste);
    setShowListeDetail(true);
    // Film ID'lerini bul
    await findMovieIds(liste);
    // Skeleton başlat
    const loadingMap: { [key: string]: boolean } = {};
    liste.filmler.forEach(film => {
      loadingMap[film.filmAdi] = true;
    });
    setLoadingPoster(loadingMap);
  };

  const handleCloseListeDetail = () => {
    setShowListeDetail(false);
    setSelectedListe(null);
  };

  const handleMovieClick = (filmAdi: string) => {
    const movieData = filmData.get(filmAdi);
    if (movieData) {
      setSelectedMovieId(movieData.id);
      setShowMovieDetail(true);
    }
  };

  const handleCloseMovieModal = () => {
    setShowMovieDetail(false);
    setSelectedMovieId(null);
  };

  return (
    <IonPage className={styles.listsPage}>
      <IonContent className={styles.listsContent}>
        <TopHeaderBar title="Cinenar Listeler" />
        {/* Ana Liste Görünümü */}
        {!showListeDetail ? (
          <div className="p-4 pb-24">
            
            {isInitialLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="bg-gray-800 rounded-xl overflow-hidden">
                    {/* Poster Skeleton */}
                    <div className="h-48 bg-gray-700 animate-pulse"></div>
                    {/* Content Skeleton */}
                    <div className="p-4 bg-gray-800 space-y-2">
                      <SkeletonLoader type="text" width="w-3/4" height="h-6" />
                      <SkeletonLoader type="text" width="w-full" height="h-4" />
                      <SkeletonLoader type="text" width="w-2/3" height="h-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filmListeleri.filmListeleri.map((liste: Liste, index: number) => {
                  const posterPath = getListePoster(liste);
                  return (
                    <div
                      key={index}
                      className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleListeClick(liste)}
                    >
                      {/* Poster Alanı */}
                      <div className="h-48 bg-gray-700 relative">
                        {posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                            alt={liste.listeAdi}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                            <span className="text-white text-lg font-bold text-center px-4">{liste.listeAdi}</span>
                          </div>
                        )}
                        
                        {/* Film Sayısı Badge */}
                        <div className="absolute top-3 right-3 bg-[#FE7743] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          {liste.filmSayisi} film
                        </div>
                      </div>
                      
                      {/* Liste Bilgileri */}
                      <div className="p-4 bg-gray-800">
                        <h3 className="text-white font-bold text-lg font-poppins mb-2">{liste.listeAdi}</h3>
                        <p className="text-[#EFEEEA] text-sm font-poppins">{liste.aciklama}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Liste Detay Görünümü */
          <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
              <button
                onClick={handleCloseListeDetail}
                className="mr-4 p-2 text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-white font-bold text-xl font-poppins">{selectedListe?.listeAdi}</h1>
            </div>
            
            <p className="text-[#EFEEEA] text-sm mb-6 font-poppins">{selectedListe?.aciklama}</p>
            
            <div className="grid grid-cols-3 gap-3">
              {selectedListe?.filmler.map((film, index) => {
                const movieData = filmData.get(film.filmAdi);
                const isLoading = loadingPoster[film.filmAdi];
                return (
                  <div
                    key={index}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleMovieClick(film.filmAdi)}
                  >
                    <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden mb-2">
                      {movieData?.posterPath ? (
                        <>
                          {isLoading && (
                            <div className="w-full h-full bg-gray-700 animate-pulse" />
                          )}
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movieData.posterPath}`}
                            alt={film.filmAdi}
                            className={`w-full h-full object-cover ${isLoading ? 'hidden' : ''}`}
                            onLoad={() => handlePosterLoad(film.filmAdi)}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                          <span className="text-white text-sm font-bold text-center px-2">{film.filmAdi}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-white text-xs font-medium font-poppins">{film.filmAdi}</p>
                      <p className="text-[#FE7743] text-xs font-poppins">{film.yil}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNavBar className="rounded-t-[24px]" />

        {/* Movie Detail Modal */}
        <MovieDetailModal
          open={showMovieDetail}
          onClose={handleCloseMovieModal}
          movieId={selectedMovieId}
        />
      </IonContent>
    </IonPage>
  );
};

export default Lists; 