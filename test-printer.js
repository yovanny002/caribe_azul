const { printer: ThermalPrinter, types: PrinterTypes } = require("node-thermal-printer");
const printerDriver = require("printer"); // Asegúrate de tener `npm install printer`

const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: 'windows', // 👈 Indica que es una impresora del sistema
  driver: printerDriver, // 👈 El driver de sistema
  options: {
    printer: '2C-POS80-01-V6 Printer(2)' // 👈 Nombre exacto de tu impresora térmica
  },
  width: 48,
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: "-",
});

async function testPrint() {
  try {
    console.log("🖨️ Iniciando prueba de impresión...");

    printer.alignCenter();
    printer.setTypeFontB();
    printer.println("CARIBE AZUL");
    printer.setTypeFontA();
    printer.drawLine();

    printer.println("PRUEBA DE IMPRESIÓN");
    printer.println(new Date().toLocaleString('es-DO'));
    printer.drawLine();

    printer.println("Gracias por usar nuestro sistema");
    printer.cut();

    const success = await printer.execute();
    console.log(success ? "✅ Ticket impreso correctamente" : "❌ No se imprimió");

  } catch (error) {
    console.error("❌ Error durante impresión:", error.message);
  }
}

testPrint();
