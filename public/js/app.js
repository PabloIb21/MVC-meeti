import { OpenStreetMapProvider } from "leaflet-geosearch";
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';

const lat = document.querySelector('#lat').value || 25.683497266;
const lng = document.querySelector('#lng').value || -100.286165522;
const direccion = document.querySelector('#direccion').value || '';
const map = L.map('mapa').setView([lat, lng], 15);

let markers = new L.featureGroup().addTo(map);
let marker;

const geocodeService = L.esri.Geocoding.geocodeService();

if(lat && lng) {
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    }).addTo(map)
    .bindPopup(direccion)
    .openPopup();

    markers.addLayer(marker);

    marker.on('moveend', function(e) {
        marker = e.target;
        const pos = marker.getLatLng();
        map.panTo(new L.LatLng(pos.lat, pos.lng));

        geocodeService.reverse().latlng(pos, 15).run(function(error, result) {
            marker.bindPopup(result.address.LongLabel);

            llenarInputs(result);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const buscador = document.querySelector('#buscador');
    buscador.addEventListener('input', buscarDireccion);
});

function buscarDireccion(e) {
    if(e.target.value.length > 8) {

        markers.clearLayers();

        const provider = new OpenStreetMapProvider();
        provider.search({ query: e.target.value })
            .then(resultado => {
                
                geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function(error, result) {
                    llenarInputs(result);

                    map.setView(resultado[0].bounds[0], 15);

                    marker = new L.marker(resultado[0].bounds[0], {
                        draggable: true,
                        autoPan: true
                    }).addTo(map)
                    .bindPopup(resultado[0].label)
                    .openPopup();

                    marker.on('moveend', function(e) {
                        marker = e.target;
                        const pos = marker.getLatLng();
                        map.panTo(new L.LatLng(pos.lat, pos.lng));

                        geocodeService.reverse().latlng(pos, 15).run(function(error, result) {
                            marker.bindPopup(result.address.LongLabel);

                            llenarInputs(result);
                        });
                    });

                    markers.addLayer(marker);
                });

            });
    }
}

function llenarInputs(resultado) {
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#estado').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';
}