import React, { Component } from "react";
import "../css/coords.css";
import estilos from "../jsons/estilosMapa.json";

var initialPoly = [
  { lat: -30.085215, lng: -58.439112 },
  { lat: -30.085215, lng: -53.169667 },
  { lat: -35.031419, lng: -53.169667 },
  { lat: -35.031419, lng: -58.439112 }
];
var defaultPoly = JSON.stringify(initialPoly, null, 2);

export class GenerarCoordenadas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      poligonos: [],
      actual: initialPoly,
      color: "#ff0000",
      nombre: "Initial",
      texto: defaultPoly,
      copiado: false,
      copiar: "",
      save_err: false,
      json_carga: "",
      cargar_json_visible: false,
      error_json_carga: false,
      center: {
        lat: -33.190363,
        lng: -56.033073
      },
      deshacer: [],
      arrastrando: false,
      keys: {}
    };

    this.changeColor = this.changeColor.bind(this);
    this.handleInputs = this.handleInputs.bind(this);
    this.resetPoly = this.resetPoly.bind(this);
    this.savePoly = this.savePoly.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleDown = this.handleDown.bind(this);
    this.refPolis = React.createRef();
  }

  copyToClipboard() {
    this.refPolis.current.select();
    document.execCommand("copy");
    this.refPolis.current.blur();
    this.setState({ copiado: true }, () => {
      setTimeout(() => {
        this.setState({ copiado: false });
      }, 5000);
    });
  }

  formatear(dato) {
    var htmlStr = "";

    var len = 0;
    if (dato.getLength) {
      len = dato.getLength();
    } else {
      len = dato.length;
    }

    for (var i = 0; i < len; i++) {
      if (dato.getLength) {
        htmlStr += "{" + dato.getAt(i).toUrlValue(5) + "}, ";
      } else {
        let { lat, lng } = dato[i];
        htmlStr += "{" + lat + "," + lng + "}, ";
      }
    }

    htmlStr = htmlStr
      .replace(/{/g, '{"lat":')
      .replace(/,/g, `, "lng":`)
      .replace(/, "lng": /g, ",");

    htmlStr = "[" + htmlStr.substring(0, htmlStr.length - 1) + "]";
    return htmlStr;
  }

  savePoly() {
    var { nombre, color, poligonos, actual, nombre } = this.state;

    //  busco poligonos con el mismo nombre
    var repetido = poligonos.find(
      item => item.nombre.toLowerCase() == nombre.toLowerCase()
    );
    if (repetido || nombre == "") {
      this.setState({
        save_err: true
      });

      return null;
    }

    var nPoli = {
      nombre,
      color,
      data: actual,
      texto: this.formatear(actual)
    };

    var textToCopy = `{"Zones":[`;

    [...poligonos, nPoli].forEach(item => {
      textToCopy += `{"Zone":"${item.nombre}","Coordinates":`;
      textToCopy += this.formatear(item.data);
      textToCopy += `,"Color":"${item.color}"`;
      textToCopy += "},";
    });

    textToCopy = textToCopy.substring(0, textToCopy.length - 1) + "]}";
    textToCopy = JSON.stringify(JSON.parse(textToCopy), null, 2);

    // creo un nuevo poligono en el centro del mapa
    var b = this.map.getBounds();
    var ob1 = Object.keys(b)[0];
    var ob2 = Object.keys(b)[1];
    var subob1 = Object.keys(b[ob1])[0];
    var subob2 = Object.keys(b[ob1])[1];

    var longitudes = {
      menor: b[ob2][subob1],
      mayor: b[ob2][subob2]
    };
    var latitudes = {
      menor: b[ob1][subob1],
      mayor: b[ob1][subob2]
    };

    var center = {
      lat: this.map.center.lat(),
      lng: this.map.center.lng()
    };
    longitudes.mayor = longitudes.mayor - (longitudes.mayor - center.lng) * 0.5;
    longitudes.menor = longitudes.menor - (longitudes.menor - center.lng) * 0.5;
    latitudes.mayor = latitudes.mayor - (latitudes.mayor - center.lat) * 0.5;
    latitudes.menor = latitudes.menor - (latitudes.menor - center.lat) * 0.5;

    var bounds = [
      { lat: latitudes.menor, lng: longitudes.mayor },
      { lat: latitudes.menor, lng: longitudes.menor },
      { lat: latitudes.mayor, lng: longitudes.menor },
      { lat: latitudes.mayor, lng: longitudes.mayor }
    ];

    this.setState(
      {
        poligonos: [...poligonos, nPoli],
        nombre: "",
        color: "#ff0000",
        texto: JSON.stringify(bounds, null, 2),
        actual: bounds,
        copiar: textToCopy,
        save_err: false,
        deshacer: []
      },
      () => {
        this.drawMap();
      }
    );
  }

  resetPoly() {
    var center = {
      lat: this.map.center.lat(),
      lng: this.map.center.lng()
    };

    var b = this.map.getBounds();
    var ob1 = Object.keys(b)[0];
    var ob2 = Object.keys(b)[1];
    var subob1 = Object.keys(b[ob1])[0];
    var subob2 = Object.keys(b[ob1])[1];

    var longitudes = {
      menor: b[ob2][subob1],
      mayor: b[ob2][subob2]
    };
    var latitudes = {
      menor: b[ob1][subob1],
      mayor: b[ob1][subob2]
    };

    longitudes.mayor = longitudes.mayor - (longitudes.mayor - center.lng) * 0.5;
    longitudes.menor = longitudes.menor - (longitudes.menor - center.lng) * 0.5;
    latitudes.mayor = latitudes.mayor - (latitudes.mayor - center.lat) * 0.5;
    latitudes.menor = latitudes.menor - (latitudes.menor - center.lat) * 0.5;

    var bounds = [
      { lat: latitudes.menor, lng: longitudes.mayor },
      { lat: latitudes.menor, lng: longitudes.menor },
      { lat: latitudes.mayor, lng: longitudes.menor },
      { lat: latitudes.mayor, lng: longitudes.mayor }
    ];

    this.setState(
      {
        nombre: "",
        color: "#ff0000",
        texto: JSON.stringify(bounds, null, 2),
        actual: bounds,
        deshacer: []
      },
      () => {
        this.drawMap();
      }
    );
  }

  changeColor(e) {
    this.setState(
      {
        color: e.target.value
      },
      () => {
        this.drawMap();
      }
    );
  }

  handleInputs(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  componentDidMount() {
    var textToCopy = `{"Zones":[`;
    const { poligonos, actual } = this.state;
    [
      ...poligonos,
      { data: actual, nombre: "Initial", color: "#ff0000" }
    ].forEach(item => {
      textToCopy += `{"Zone":"${item.nombre}","Coordinates":`;
      textToCopy += this.formatear(item.data);
      textToCopy += `,"Color":"${item.color}"`;
      textToCopy += "},";
    });

    this.setState({
      copiar: textToCopy
    });
    this.drawMap();
  }

  undo() {
    const { deshacer } = this.state;
    this.setState(
      {
        actual: deshacer[deshacer.length - 1],
        deshacer: [...deshacer.slice(0, -1)],
        texto: JSON.stringify(deshacer[deshacer.length - 1])
      },
      () => {
        this.drawMap();
      }
    );
  }

  drawMap() {
    if (!window.google) {
      this.timeout = setTimeout(() => {
        this.drawMap();
      }, 100);

      return null;
    }

    const { lat, lng } = this.state.center;

    if (!this.map) {
      this.map = new window.google.maps.Map(
        document.getElementById("map-container"),
        {
          zoom: 6,
          center: new window.google.maps.LatLng(lat, lng),
          styles: estilos
        }
      );
    }
    const { actual, poligonos, color } = this.state;

    if (this.poligonos_guardados) {
      this.poligonos_guardados.forEach(item => {
        item.setMap(null);
      });
    }
    if (this.poliActual) {
      this.poliActual.setMap(null);
    }

    const abrirVentana = (i, e) => {
      var contentString = `<div class='googleCuadro'>${poligonos[i].nombre}</div>`;

      if (this.infowindow) {
        this.infowindow.close();
      }
      this.infowindow = new window.google.maps.InfoWindow();
      this.infowindow.setContent(contentString);
      this.infowindow.setPosition(e.latLng);
      this.infowindow.open(this.map);
    };

    // const over = (i, e) => {
    //   this.poligonos_guardados[i].setOptions({
    //     strokeOpacity: 1,
    //     fillOpacity: 0.55
    //   });
    // };
    // const out = (i, e) => {
    //   this.poligonos_guardados[i].setOptions({
    //     strokeOpacity: 0.8,
    //     fillOpacity: 0.35
    //   });
    // };

    this.poligonos_guardados = poligonos.map((item, i) => {
      var npoli = new window.google.maps.Polygon({
        paths: item.data,
        draggable: false,
        editable: false,
        strokeColor: item.color,
        strokeOpacity: 0.58,
        strokeWeight: 2,
        fillColor: item.color,
        fillOpacity: 0.15
      });

      npoli.setMap(this.map);

      npoli.addListener("click", abrirVentana.bind(this, i));

      // window.google.maps.event.addListener(
      //   npoli,
      //   "mouseover",
      //   over.bind(this, i)
      // );
      // window.google.maps.event.addListener(
      //   npoli,
      //   "mouseout",
      //   out.bind(this, i)
      // );

      return npoli;
    });

    this.poliActual = new window.google.maps.Polygon({
      paths: actual,
      draggable: true,
      editable: true,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35
    });

    this.poliActual.setMap(this.map);

    const getPolygonCoords = tipo => {
      var len = this.poliActual.getPath().getLength();
      var htmlStr = "";
      for (var i = 0; i < len; i++) {
        htmlStr +=
          "{" +
          this.poliActual
            .getPath()
            .getAt(i)
            .toUrlValue(5) +
          "}, ";
      }

      htmlStr = htmlStr
        .replace(/{/g, '{"lat":')
        .replace(/,/g, `, "lng":`)
        .replace(/, "lng": /g, ",");

      htmlStr = "[" + htmlStr.substring(0, htmlStr.length - 1) + "]";

      const { deshacer, texto } = this.state;
      var undo = [];
      if (deshacer.length < 8) {
        undo = [...deshacer, JSON.parse(texto)];
      } else {
        undo = [...deshacer.slice(1), JSON.parse(texto)];
      }

      var estado = {
        texto: JSON.stringify(JSON.parse(htmlStr), null, 2),
        actual: JSON.parse(htmlStr),
        deshacer: undo
      };
      if (tipo == "dragstart") {
        estado.arrastrando = true;
      } else if (tipo == "dragend") {
        estado.arrastrando = false;
      }

      if ((this.state.arrastrando && tipo == "setat") || tipo == "dragend") {
        estado.deshacer = deshacer;
      }

      this.setState(estado);
    };

    const changeCenter = () => {
      this.setState({
        center: {
          lat: this.map.center.lat(),
          lng: this.map.center.lng()
        }
      });
    };

    window.google.maps.event.addListener(
      this.poliActual.getPath(),
      "insert_at",
      getPolygonCoords.bind(this, "insertat")
    );
    window.google.maps.event.addListener(
      this.poliActual.getPath(),
      "set_at",
      getPolygonCoords.bind(this, "setat")
    );
    window.google.maps.event.addListener(
      this.poliActual,
      "dragend",
      getPolygonCoords.bind(this, "dragend")
    );
    window.google.maps.event.addListener(
      this.poliActual,
      "dragstart",
      getPolygonCoords.bind(this, "dragstart")
    );

    window.google.maps.event.addListener(
      this.map,
      "bounds_changed",
      changeCenter.bind(this)
    );

    this.setState({
      center: {
        lat: this.map.center.lat(),
        lng: this.map.center.lng()
      }
    });
  }

  editPoli(i) {
    var { poligonos } = this.state;
    var actual = poligonos[i].data;
    var color = poligonos[i].color;
    var nombre = poligonos[i].nombre;

    this.setState(
      {
        actual,
        nombre,
        color,
        poligonos: [...poligonos.filter((item, k) => k != i)],
        texto: this.formatear(actual),
        deshacer: []
      },
      () => {
        this.map = null;
        window.scrollTo({ top: 0, behavior: "smooth" });
        this.drawMap();

        // centro el mapa en el poligono nuevo
        var maxlat = Math.max.apply(null, [...actual.map(item => item.lat)]);
        var maxlng = Math.max.apply(null, [...actual.map(item => item.lng)]);
        var minlat = Math.min.apply(null, [...actual.map(item => item.lat)]);
        var minlng = Math.min.apply(null, [...actual.map(item => item.lng)]);

        var upright = new window.google.maps.LatLng(maxlat, maxlng);
        var downleft = new window.google.maps.LatLng(minlat, minlng);
        var bounds = new window.google.maps.LatLngBounds();
        bounds.extend(upright);
        bounds.extend(downleft);

        this.map.fitBounds(bounds);
        this.map.panToBounds(bounds);
      }
    );
  }

  downloadJson() {
    var contenidoEnBlob = new Blob(
      [decodeURIComponent(encodeURI(this.state.copiar))],
      { type: "application/json;charset=utf-8;" }
    );

    const { poligonos } = this.state;
    var nombre = "Zones-";
    var extra_names = poligonos.map(item => item.nombre);
    nombre += extra_names.join("_");

    var reader = new FileReader();
    reader.onload = e => {
      var save = document.createElement("a");
      save.href = e.target.result;
      save.target = "_blank";
      save.download = nombre + ".json";
      var clicEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true
      });
      save.dispatchEvent(clicEvent);
      (window.URL || window.webkitURL).revokeObjectURL(save.href);
    };

    reader.readAsDataURL(contenidoEnBlob);
  }

  toggle(variable) {
    this.setState({
      [variable]: !this.state[variable]
    });
  }

  cargarJson() {
    var { json_carga, poligonos } = this.state;
    var data = null;

    try {
      data = JSON.parse(json_carga);
    } catch {
      this.setState({
        error_json_carga: true
      });
      return null;
    }

    var error = false;
    if (!("Zones" in data)) {
      this.setState({
        error_json_carga: true
      });
      return null;
    }

    for (let i = 0; i < data.Zones.length; i++) {
      if (
        !"Zone" in data.Zones[i] ||
        !"Coordinates" in data.Zones[i] ||
        !"Color" in data.Zones[i]
      ) {
        error = true;
        break;
      }
    }

    if (error) {
      this.setState({
        error_json_carga: true
      });
      return null;
    }

    data.Zones.forEach(item => {
      poligonos = poligonos.filter(
        k => k.nombre.toLowerCase() != item.Zone.toLowerCase()
      );
    });

    var dataParseada = data.Zones.map(item => {
      var res = {
        nombre: item.Zone,
        data: item.Coordinates,
        texto: this.formatear(item.Coordinates),
        color: item.Color
      };
      return res;
    });

    var textToCopy = `{"Zones":[`;

    [...poligonos, ...dataParseada].forEach(item => {
      textToCopy += `{"Zone":"${item.nombre}","Coordinates":`;
      textToCopy += this.formatear(item.data);
      textToCopy += `,"Color":"${item.color}"`;
      textToCopy += "},";
    });

    textToCopy = textToCopy.substring(0, textToCopy.length - 1) + "]}";
    textToCopy = JSON.stringify(JSON.parse(textToCopy), null, 2);

    this.setState(
      {
        poligonos: [...poligonos, ...dataParseada],
        cargar_json_visible: false,
        json_carga: "",
        copiar: textToCopy,
        error_json_carga: false
      },
      () => {
        this.drawMap();
      }
    );
  }

  cleanJson() {
    this.setState({
      json_carga: ""
    });
  }

  delete(k) {
    var textToCopy = `{"Zones":[`;
    var poligonos = [...this.state.poligonos.filter((item, i) => i != k)];

    poligonos.forEach(item => {
      textToCopy += `{"Zone":"${item.nombre}","Coordinates":`;
      textToCopy += this.formatear(item.data);
      textToCopy += `,"Color":"${item.color}"`;
      textToCopy += "},";
    });

    textToCopy = textToCopy.substring(0, textToCopy.length - 1) + "]}";

    this.setState(
      {
        poligonos,
        copiar: textToCopy
      },
      () => {
        this.drawMap();
      }
    );
  }

  handleDown(e) {
    const { deshacer, keys } = this.state;
    if (e.keyCode != 90 && e.keyCode != 17 && e.which != 90 && e.which != 17) {
      return null;
    }
    this.setState({ keys: { ...keys, [e.keyCode || e.which]: true } }, () => {
      if (deshacer.length > 0) {
        if (this.state.keys[17] && this.state.keys[90]) {
          this.undo();
        }
      }
    });
  }

  handleUp(e) {
    this.setState({
      keys: { ...this.state.keys, [e.keyCode || e.which]: false }
    });
  }

  render() {
    const {
      poligonos,
      texto,
      color,
      nombre,
      copiar,
      copiado,
      save_err,
      cargar_json_visible,
      json_carga,
      error_json_carga,
      deshacer
    } = this.state;

    return (
      <div className="generar">
        {cargar_json_visible && (
          <div className="modal">
            <div className="contenedor">
              <i
                className="fas fa-times"
                onClick={this.toggle.bind(this, "cargar_json_visible")}
              />
              <div className="titulo">Load JSON</div>
              <div className="contenido">
                <textarea
                  name="json_carga"
                  onChange={this.handleInputs}
                  value={json_carga}
                  placeholder="Paste JSON"
                />
                <small>
                  Paste a JSON to add it to the map, if there is already a zone
                  with the same name as one in the JSON, it will get replaced.
                </small>
                {error_json_carga && (
                  <p className="errJson">JSON loaded is invalid.</p>
                )}
                <button onClick={this.cargarJson.bind(this)}>Load Json</button>
                <button onClick={this.cleanJson.bind(this)}>Clean</button>
              </div>
            </div>
          </div>
        )}
        <div className="titulo">Generate Coordinates</div>
        <div className="elemento seccion-mapa">
          <div className="titulo">Map</div>
          <div className="content">
            <div className="mapa">
              <div
                id="map-container"
                onKeyDown={this.handleDown}
                onKeyUp={this.handleUp}
              />
              {deshacer.length > 0 && (
                <button className="desh" onClick={this.undo.bind(this)}>
                  Undo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="elemento controles">
          <div className="titulo">Controls</div>
          <div className="content">
            {" "}
            <label>
              Zone name:{" "}
              <input
                type="text"
                name="nombre"
                value={nombre}
                onChange={this.handleInputs}
              />
            </label>
            <label>
              Select polygon color:
              <input
                type="color"
                value={color}
                name="color"
                onChange={this.changeColor}
              />
            </label>
            <label>
              Current Polygon
              <textarea value={texto} readOnly />
            </label>
            <div className="acciones">
              <button onClick={this.savePoly}>Save current polygon</button>
              <button onClick={this.resetPoly}>Reset polygon</button>
              <button onClick={this.toggle.bind(this, "cargar_json_visible")}>
                Load JSON
              </button>
              {save_err && (
                <p className="save_err">
                  Zone Name is empty or already in use.
                </p>
              )}
            </div>
          </div>
        </div>
        {poligonos.length > 0 && (
          <div className="elemento">
            <div className="titulo">Zones</div>

            <div className="content">
              <div className="poligonos">
                <textarea ref={this.refPolis} value={copiar} readOnly />
                <div className="succ" onClick={this.copyToClipboard.bind(this)}>
                  Copy
                </div>
                <div className="succ" onClick={this.downloadJson.bind(this)}>
                  Download JSON
                </div>
                {copiado && (
                  <span>
                    Copied <i className="fas fa-clipboard-check"></i>
                  </span>
                )}
                <small>Only saved zones will be added to the final JSON</small>

                <div className="botones">
                  <h2>Edit zones</h2>
                  {poligonos.map((item, i) => {
                    return (
                      <div
                        key={i}
                        onClick={this.editPoli.bind(this, i)}
                        className="poligono"
                        style={{ background: item.color }}
                        title={`Edit zone ${item.nombre}`}
                      >
                        {item.nombre}
                      </div>
                    );
                  })}
                  <h2>Delete zones</h2>
                  {poligonos.map((item, i) => {
                    return (
                      <div
                        key={i}
                        onClick={this.delete.bind(this, i)}
                        className="poligono"
                        style={{ background: item.color }}
                        title={`Delete zone ${item.nombre}`}
                      >
                        {item.nombre}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default GenerarCoordenadas;
