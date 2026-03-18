import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  PageBreak,
  convertInchesToTwip,
} from "docx";

interface Founder {
  name: string;
  idNumber?: string;
  jmbg?: string;
  address: string;
  sharePercentage: number;
  birthPlace?: string;
  issuedBy?: string;
  isResident?: boolean;
}

interface DocumentData {
  companyName: string;
  city: string;
  founders: Founder[];
  capital: number;
  activity: string;
  activityCode?: string;
  allActivities?: string;
  address: string;
  email?: string;
  phone?: string;
  currentDate?: string;
}

export class DocxGenerator {
  async generateStatut(data: DocumentData): Promise<Buffer> {
    const founderName = data.founders[0]?.name || "_______________";
    const founderJmbg = data.founders[0]?.jmbg || "__________________";

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.79),
                bottom: convertInchesToTwip(0.79),
                left: convertInchesToTwip(0.79),
                right: convertInchesToTwip(0.79),
              },
            },
          },
          children: [
            // STRANICA 1 - Naslovna strana
            new Paragraph({
              text: "",
              spacing: { before: convertInchesToTwip(3) },
            }),
            new Paragraph({
              text: "STATUT",
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              style: "Heading1",
            }),
            new Paragraph({
              text: "Društva sa ograničenom odgovornošću",
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              style: "Heading2",
            }),
            new Paragraph({
              text: `"${data.companyName}" - ${data.city}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: convertInchesToTwip(4) },
              style: "Heading2",
            }),
            new Paragraph({
              text: `${data.city}, ${data.currentDate}.`,
              alignment: AlignmentType.CENTER,
            }),

            // PAGE BREAK - Prelazak na stranicu 2
            new Paragraph({
              children: [new PageBreak()],
            }),

            // STRANICA 2 - Pravna osnova i naslov statuta
            new Paragraph({
              text: `Na osnovu odredbi člana 363 Zakona o privrednim društvima ("Službeni list Crne Gore", br. 090/25 od 06.08.2025 godine) Osnivač društva sa ograničenom odgovornošću "${data.companyName}" ${founderName} JMBG ${founderJmbg} (u daljem tekstu: „Društvo"), dana ${data.currentDate} godine, donosi:`,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 800 },
            }),

            new Paragraph({
              text: "STATUT",
              alignment: AlignmentType.CENTER,
              spacing: { before: 800, after: 200 },
              style: "Heading1",
            }),
            new Paragraph({
              text: "DRUŠTVA SA OGRANIČENOM ODGOVORNOŠĆU",
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              style: "Heading2",
            }),
            new Paragraph({
              text: `»${data.companyName}« - ${data.city}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              style: "Heading2",
            }),

            // PAGE BREAK - Prelazak na stranicu 3
            new Paragraph({
              children: [new PageBreak()],
            }),

            // STRANICA 3+ - Sadržaj statuta
            new Paragraph({
              text: "I OPŠTE ODREDBE",
              heading: HeadingLevel.HEADING_3,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 1", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Društvo sa ograničenom odgovornošću je privredno društvo čiji je osnovni kapital utvrđen i podijeljen na udjele koji su u svojini jednog ili više članova.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Društvo sa ograničenom odgovornošću može imati najviše 30 članova.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Statut obavezno sadrži:",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: "poslovno ime, sjedište i pretežnu djelatnost društva sa ograničenom odgovornošću;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "iznos osnovnog kapitala;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "udio svakog člana društva u ukupnom osnovnom kapitalu, izražen u procentima;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "način i postupak sazivanja sjednice skupštine društva sa ograničenom odgovornošću i način donošenja odluka skupštine;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "nadležnosti organa upravljanja društva sa ograničenom odgovornošću, broj članova ovih organa, bliži način njihovog imenovanja i razrješenja, kao i način donošenja odluka tih organa;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "postupak za izmjene i dopune statuta.",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Pored elemenata iz stava 1 ovog člana, statut društva sa ograničenom odgovornošću može da sadrži i druge elemente, u skladu sa zakonom.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Statut društva sa ograničenom odgovornošću može se izmijeniti odlukom članova društva koji posjeduju udjele koji predstavljaju dvotrećinsku većinu glasačkih prava, ako statutom društva nijesu predviđeni drugi uslovi i/ili druga većina, koja ne može biti niža od obične većine svih glasova.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // II POSLOVNO IME I SJEDIŠTE DRUŠTVA
            new Paragraph({
              text: "II POSLOVNO IME I SJEDIŠTE DRUŠTVA",
              heading: HeadingLevel.HEADING_3,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 2", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: `Poslovno ime društva sa ograničenom odgovornošću je:`,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.companyName} društvo sa ograničenom odgovornošću/DOO ${data.address}`,
                  bold: true,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Skraćeno poslovno ime društva sa ograničenom odgovornošću je:",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${data.companyName} DOO`, bold: true }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: `Sjedište društva je u ${data.city}, ${data.address}.`,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Promjena poslovnog imena Društva:",
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "O promjeni registrovanog poslovnog imena društva odlučuje Osnivač.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Pečat Društva:", bold: true })],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Pečat Društva je okruglog oblika sa tekstom kako slijedi: »${data.companyName}« u sredini i »društvo sa ograničenom odgovornošću u ${data.city}« po ivicama istog. Pečat je ispisan latinicom.`,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Štambilj Društva:", bold: true }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "Društvo ima svoj štambilj koji je pravougaonog oblika i sadrži ime društva i mjesto za upis broja i datuma akta koji se arhivira. Štambilj je ispisan latinicom.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Kontakt telefona i email Društva:",
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Broj telefona Društva je ${data.phone || "_______________"}.`,
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({
              text: `E-mail adresa Društva je: ${data.email || "_______________"}`,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // III DJELATNOSTI DRUŠTVA
            new Paragraph({
              text: "III DJELATNOSTI DRUŠTVA",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 3", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Pretežna djelatnost društva sa ograničenom odgovornošću je:",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.activityCode || ""} - ${data.activity}`,
                  bold: true,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Društvo će obavljati i sljedeće djelatnosti:",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: data.allActivities || "",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Društvo može obavljati i sve druge poslove koji ne spadaju u njegovu djelatnost, ali po prirodi spadaju kao pomoćna djelatnost u realizovanju osnovne djelatnosti za koju je registrovano Društvo, bez ograničenja, u inostranstvu ili kada neka od djelatnosti ima inostrani element, za šta u skladu sa zakonskim propisima Crne Gore pribavlja odgovarajuću dokumentaciju.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Promjena djelatnosti:", bold: true }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "Društvo može promijeniti svoju djelatnost na osnovu odluke Osnivača, u skladu sa odredbama Statuta. Dijelovi privrednog društva i sektori Društva osnivaju se i prestaju na osnovu odluke Osnivača i u postupku koji je predviđen Zakonom, i isti mogu istupiti u pravnom prometu sa trećim licima u okviru djelatnosti i ovlašćenja Društva kao cjeline.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // IV IZNOS OSNIVAČKOG KAPITALA I ODGOVORNOST OSNIVAČA
            new Paragraph({
              text: "IV IZNOS OSNIVAČKOG KAPITALA I ODGOVORNOST OSNIVAČA",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 4", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: "Osnivački kapital Društva iznosi " }),
                new TextRun({ text: `${data.capital} EUR`, bold: true }),
                new TextRun({
                  text: ", a sastoji se u cijelosti od novčanog kapitala.",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Društvo je osnovano kao društvo sa ograničenom odgovornošću - DOO i osnivač odgovara za obaveze Društva do visine uloženog kapitala.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            ...data.founders.map(
              (founder) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: founder.name, bold: true }),
                    new TextRun({
                      text: `, ${
                        founder.isResident
                          ? `JMBG ${founder.jmbg}`
                          : `broj pasoša ${founder.idNumber}`
                      } kao Osnivač, raspolaže sa ${founder.sharePercentage}% upravljačkih i vlasničkih prava.`,
                    }),
                  ],
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { after: 200 },
                }),
            ),

            new Paragraph({
              text: "Ulog može da bude i u nenovčanom obliku, u kom slučaju se vrši procjena uloga.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // V ORGANI DRUŠTVA
            new Paragraph({
              text: "V ORGANI DRUŠTVA",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 5", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Osnivač Društva upravlja cjelokupnim radom i poslovanjem Društva na način i pod uslovima predviđenim Odlukom o osnivanju i ovim Statutom.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Organi Društva su:",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: "Skupština društva sa ograničenom odgovornošću;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "Direktor",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Osnivač Društva može obavljati dužnost direktora ili imenovati drugo lice.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Isključivo pravo Osnivača Društva je da:",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: "vrši izmjene i dopune, odnosno donosi novi statut društva i sačinjava prečišćeni tekst statuta društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "imenuje i razrješava direktora, odnosno članove odbora direktora;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "imenuje i razrješava revizora;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "imenuje i razrješava likvidatora;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "donosi odluku o dobrovoljnoj likvidaciji društva ili podnošenju predloga za pokretanje stečajnog postupka;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "usvaja finansijske iskaze, kao i izvještaje revizora, ako su finansijski iskazi bili predmet revizije;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "donosi odluku o raspodjeli dobiti i načinu pokrića gubitaka;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "donosi odluku o povećanju ili smanjenju osnovnog kapitala društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "donosi odluku o statusnim promjenama i promjenama pravnog oblika;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "donosi odluku o sticanju sopstvenih udjela;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "donosi odluku o zahtjevu za istupanje člana iz društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "donosi odluku o pokretanju postupka i davanju punomoćja za zastupanje društva u sporu sa prokuristom, kao i u sporu sa direktorom;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "donosi odluku o pokretanju postupka i davanju punomoćja za zastupanje društva u sporu protiv člana društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "donosi poslovnik;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "odlučuje o drugim pitanjima, u skladu sa ovim zakonom i statutom društva.",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Pitanje radnog angažovanja direktora i zarade uređuju se posebnim ugovorom koji u ime Društva potpisuje Osnivač društva.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Nadležnost direktora Društva:",
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: "zastupa društvo prema trećim licima u skladu sa statutom i odlukama skupštine društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "vodi poslove društva u skladu sa statutom i odlukama skupštine društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "odlučuje o unutrašnjoj organizaciji društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "vrši unutrašnji nadzor nad obavljanjem djelatnosti društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "saziva sjednice skupštine društva i utvrđuje predlog dnevnog reda sa predlozima odluka;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "izvršava odluke skupštine društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "daje i opoziva prokuru;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "izvještava skupštinu društva u skladu sa ovim zakonom i statutom društva;",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
            }),
            new Paragraph({
              text: "vrši druge poslove u skladu sa ovim zakonom i statutom društva.",
              alignment: AlignmentType.JUSTIFIED,
              bullet: { level: 0 },
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Direktor može odlučiti da određene poslove iz svog djelokruga prenese na zaposlene sa posebnim ovlašćenjima i odgovornostima, izuzev poslova koji su na osnovu zakona utvrđeni kao isključiva nadležnost direktora Društva.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Direktor, kojeg imenuje Osnivač, mora biti poslovno sposobno lice, koje je zasnovalo radni odnos u Društvu.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // VI ZASTUPANJE I PREDSTAVLJANJE DRUŠTVA
            new Paragraph({
              text: "VI ZASTUPANJE I PREDSTAVLJANJE DRUŠTVA",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 6", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Društvo zastupa i predstavlja direktor ",
                }),
                new TextRun({
                  text: data.founders[0]?.name || "_____________",
                  bold: true,
                }),
                new TextRun({
                  text: `, ${
                    data.founders[0]?.isResident
                      ? `JMBG ${data.founders[0]?.jmbg}`
                      : `broj pasoša ${data.founders[0]?.idNumber}`
                  }, iz ${data.city}, adresa prebivališta ${data.founders[0]?.address}, i ovlašćen je da djeluje neograničeno.`,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Ovlašćenja direktora prilikom zastupanja društva su ograničena ovim Statutom. U saglasnosti sa Osnivačem, direktor može za zastupanje i predstavljanje društva ovlastiti i drugu osobu.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Osnivač Društva donosi odluku o osobama i načinu potpisivanja svih dokumenata Društva, sa kojim se raspolaže sredstvima Društva.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // VII POVEĆANJE I SMANJENJE KAPITALA
            new Paragraph({
              text: "VII POVEĆANJE I SMANJENJE KAPITALA",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 7", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Osnivač može u bilo koje vrijeme odlučiti da poveća ili smanji kapital Društva, u skladu sa odredbama Zakona o privrednim društvima.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // VIII KONTROLA MENADŽMENTA
            new Paragraph({
              text: "VIII KONTROLA MENADŽMENTA",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 8", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Osnivač može zahtijevati od direktora pismenu informaciju o situaciji u Društvu odnosno o pojedinim pitanjima rada Društva. Osnivač, preko svojih predstavnika, može u svakom momentu izvršiti uvid u dokumentaciju Društva.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // IX IZVJEŠTAJI I EVIDENCIJE
            new Paragraph({
              text: "IX IZVJEŠTAJI I EVIDENCIJE",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 9", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Direktor je dužan obezbijediti vođenje knjiga računa, računovodstvene evidencije i ostale evidencije, koje su potrebne, da bi se zadovoljile odredbe propisa i osiguralo potrebno preglednost poslovanja i poslova. Pri tome, direktor mora osigurati čuvanje evidencija, informacija na odgovarajućem mjestu i na odgovarajući način uz preduzimanje svih potrebnih mjera predostrožnosti za očuvanje evidencija i poslovne dokumentacije i zaštite iste.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Društvo vodi knjigu odluka. Odluke upisane u knjigu odluka Društva proizvode pravno dejstvo.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // X RASPODJELA DOBITI I SNOŠENJE GUBITAKA
            new Paragraph({
              text: "X RASPODJELA DOBITI I SNOŠENJE GUBITAKA",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 10", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Osnivač ima pravo na cjelokupnu godišnju dobit Društva (nakon oporezivanja), u iznosu određenom za raspodjelu od strane Osnivača.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Dobit za raspodjelu utvrđuje se za svaku poslovnu godinu. Osnivač može odlučiti, da se dobit izdvaja za rezerve ili za reinvestiranje u razvoj društva.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Društvo, odnosno Osnivač će pokrivati gubitke društva u skladu sa zakonom.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // XI STATUSNE PROMJENE
            new Paragraph({
              text: "XI STATUSNE PROMJENE",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 11", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Podjela društva, spajanje ili pripajanje društva i promjena oblika društva izvršava se saglasno Zakonu o privrednim društvima.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // XII PRESTANAK DRUŠTVA
            new Paragraph({
              text: "XII PRESTANAK DRUŠTVA",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 12", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Društvo se osniva na neodređeno vrijeme i to sve dok postoje ekonomski i zakonski uslovi za obavljanje njegove djelatnosti.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Društvo prestaje u slučajevima propisanim zakonima.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "U slučaju prestanka Društva, Osnivaču se vraćaju uložena sredstva, pod uslovom da je Društvo iz stečenih sredstava izmirilo sve zakonom utvrđene obaveze.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // XIII DONOŠENJE I IZMJENE STATUTA
            new Paragraph({
              text: "XIII DONOŠENJE I IZMJENE STATUTA",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 13", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Izmjene i dopune statuta donosi Osnivač društva, na način kako je i donijeto.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 400 },
            }),

            // XIV ZAVRŠNE ODREDBE
            new Paragraph({
              text: "XIV ZAVRŠNE ODREDBE",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [new TextRun({ text: "Član 14", bold: true })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Ovaj Statut stupa na snagu nakon potpisivanja od strane Osnivača i registracije kod Centralnog registra privrednih i drugih subjekata Crne Gore.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Svi opšti akti koji nijesu u suprotnosti sa zakonom i ovim statutom primjenjivaće se do donošenja novih opštih akata, a najduže šest mjeseci od dana stupanja na snagu Statuta.",
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 600 },
            }),

            // Potpis osnivača
            new Paragraph({
              text: "OSNIVAČ",
              spacing: { before: 800, after: 400 },
            }),

            ...data.founders.map(
              (founder) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: "_".repeat(40) }),
                    new TextRun({ text: "\n" }),
                    new TextRun({ text: founder.name, bold: true }),
                  ],
                  spacing: { before: 400 },
                }),
            ),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}

export const docxGenerator = new DocxGenerator();
