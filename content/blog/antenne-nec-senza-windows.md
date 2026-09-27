<!--meta
{
  "slug": "antenne-nec-senza-windows",
  "title": "Simulare antenne senza Windows: xnec2c e il dipolo a 869 MHz",
  "description": "EZNEC e 4nec2 girano solo su Windows. Con xnec2c, open source per Linux e macOS, si rifà lo stesso tutorial del dipolo a 869 MHz con il motore NEC-2.",
  "h1": "Simulare antenne senza Windows",
  "lede": "Avendo letto che EZNEC e 4nec2 girano solo su Windows, ci siamo chiesti: chi usa Linux o macOS come simula un'antenna LoRa? La risposta è che il motore di calcolo è pubblico, e attorno a lui esistono strumenti open source.",
  "published": "2026-09-26",
  "time": "11:13",
  "tags": ["antenne", "software", "autocostruzione"]
}
-->
## Da dove partiamo

Su Lora Italia Paolo ha pubblicato
[*Eznec! Chi era costui?*](https://www.loraitalia.it/eznec-chi-era-costui/),
un ottimo tutorial in italiano: un dipolo verticale a 869 MHz, prima nello
spazio libero e poi sopra un terreno reale, simulato con EZNEC. Vi consigliamo
di leggerlo: qui rifacciamo gli stessi passi con altri strumenti.

L'articolo spiega che i due programmi più usati, EZNEC e 4nec2, sono gratuiti
ma **girano solo su Windows**. E sono gratuiti, non open source: il codice non
è disponibile.

Entrambi però sono interfacce grafiche costruite sopra lo stesso motore,
il [Numerical Electromagnetics Code](https://en.wikipedia.org/wiki/Numerical_Electromagnetics_Code).
La versione NEC-2 è di pubblico dominio, e da lì sono nati diversi progetti
aperti.

## Le alternative open source

| Strumento | Cos'è | Piattaforme |
|---|---|---|
| [xnec2c](https://www.xnec2c.org/) | NEC-2 con interfaccia grafica: geometria, diagrammi, impedenza, ROS. Legge i file `.nec` di 4nec2. | Linux, BSD, macOS |
| nec2c | Il motore NEC-2 tradotto in C, da riga di comando | Ovunque |
| [necpp / PyNEC](https://github.com/tmolteno/necpp) | NEC-2 in C++ con binding Python, per simulazioni e ottimizzazioni via script | Ovunque |
| [openEMS](https://www.openems.de/) | Solutore 3D a elementi finiti nel tempo (FDTD) | Linux, Windows, macOS |

Per rifare il tutorial serve **xnec2c**, che è quello più vicino a EZNEC.
PyNEC è utile se volete l'equivalente dell'ottimizzatore di 4nec2 scritto in
Python. openEMS è un altro mondo: serve per antenne su circuito stampato e
piani di massa, dove NEC fatica. Ci torneremo.

## Installare xnec2c

- Debian, Ubuntu, Raspberry Pi OS: `sudo apt install xnec2c`
- Arch e derivate: `sudo pacman -S xnec2c` (o dall'AUR)
- Fedora: `sudo dnf install xnec2c`
- macOS: `sudo port install xnec2c` con MacPorts

## Il dipolo a 869 MHz

A differenza di EZNEC, xnec2c descrive l'antenna con un file di testo a
"schede", il formato originale di NEC. Sembra ostico, ma per un dipolo sono
poche righe. Le misure sono **in metri**. Salvate questo come
`dipolo-869.nec`:

```
CM Dipolo verticale 869 MHz, spazio libero
CE
GW 1 11 0 0 -0.0805 0 0 0.0805 0.001
GE 0
EX 0 1 6 0 1 0
FR 0 1 0 0 869 0
RP 0 37 73 1000 0 0 5 5
EN
```

Riga per riga:

- `GW`: un filo (*wire*) numero 1, diviso in **11 segmenti**, da z = −80,5 mm
  a z = +80,5 mm, quindi lungo **161 mm**, con raggio 1 mm (diametro 2 mm).
  Sono le misure a cui arriva il tutorial originale dopo aver accorciato da
  172 mm.
- `GE 0`: fine della geometria, nessun terreno (spazio libero).
- `EX`: alimentazione in tensione sul filo 1, segmento 6, cioè al centro.
- `FR`: una sola frequenza, 869 MHz.
- `RP`: calcola il diagramma di irradiazione su tutta la sfera, a passi di 5°.

Aprite il file con `xnec2c dipolo-869.nec`. Nella finestra principale
troverete l'antenna; dal menu **View** aprite il diagramma di irradiazione
e il grafico della frequenza, dove leggere impedenza e ROS. Dovreste trovare
un'impedenza vicina ai 73 Ω con reattanza piccola, e il classico diagramma
a ciambella del dipolo a mezz'onda.

Per ripetere l'esperimento sul diametro, cambiate l'ultimo numero di `GW`
in `0.005` (diametro 10 mm): la reattanza torna induttiva e, come nel
tutorial, bisogna accorciare verso i 153 mm.

### Più frequenze in un colpo

Qui xnec2c ha un vantaggio comodo: con una scheda `FR` a più passi calcola
una spazzata, e il grafico mostra subito dove l'antenna risuona.

```
FR 0 41 0 0 849 1
```

Sono 41 frequenze da 849 a 889 MHz, a passi di 1 MHz. Il minimo del ROS vi
dice se il dipolo è corto o lungo, senza tentativi.

## Sopra un terreno reale

Come nel tutorial, alziamo l'antenna di 1 metro e aggiungiamo il terreno.
Il centro del dipolo va a 1,0805 m, così l'estremità bassa sta a 1 m:

```
CM Dipolo verticale 869 MHz, 1 m sopra terreno reale
CE
GW 1 11 0 0 1.0 0 0 1.161 0.001
GE 1
GN 2 0 0 0 13 0.005
EX 0 1 6 0 1 0
FR 0 1 0 0 869 0
RP 0 19 73 1000 0 0 5 5
EN
```

- `GE 1`: c'è un terreno.
- `GN 2`: terreno reale calcolato con il metodo di Sommerfeld, il più
  accurato, con costante dielettrica 13 e conducibilità 0,005 S/m (un
  terreno "medio").
- `RP` ora calcola solo la mezza sfera sopra il suolo.

Vale lo stesso limite spiegato nell'articolo: NEC-2 non gestisce fili che
toccano il terreno o finiscono sotto. Non è un difetto di xnec2c, è il
motore: lo hanno anche EZNEC e 4nec2 nella versione gratuita.

Nel diagramma di elevazione vedrete i lobi che si formano per la riflessione
sul suolo e l'angolo di irradiazione principale che si abbassa, come nel
tutorial.

## E se proprio volete EZNEC

EZNEC e 4nec2 funzionano in genere anche sotto
[Wine](https://www.winehq.org/). Può bastare se dovete aprire un modello che
vi ha passato qualcuno. Per iniziare da zero, però, un programma nativo e
aperto è più comodo.

## Per saperne di più

- Il tutorial originale di Paolo su
  [Lora Italia](https://www.loraitalia.it/eznec-chi-era-costui/)
- La [documentazione di xnec2c](https://www.xnec2c.org/)
- Il [manuale di NEC-2](https://www.nec2.org/) con il significato di ogni
  scheda

Se simulate un'antenna per un nodo MeshCore, aggiungetela alla
[galleria delle antenne](../../antenne/): il file `.nec` è di testo, si legge
e si modifica facilmente, e la galleria lo simula e lo spiega da sola. Come
è nata lo raccontiamo in [questo post](../galleria-antenne/).
