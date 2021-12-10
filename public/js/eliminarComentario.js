import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const formsEliminar = document.querySelectorAll('.eliminar-comentario');

    if (formsEliminar.length > 0) {
        formsEliminar.forEach(form => {
            form.addEventListener('submit', eliminarComentario)
        })
    }
});

function eliminarComentario(e) {
    e.preventDefault();

    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
    }).then((result) => {
        if (result.value) {
            const comentarioId = this.children[0].value;

            const datos = {
                comentarioId
            }

            axios.post(this.action, datos)
                .then(res => {
                    Swal.fire('¡Eliminado!', res.data, 'success');

                    this.parentElement.parentElement.remove();
                }).catch(err => {
                    Swal.fire('¡Error!', err.res.data, 'error');
                });
        }
    });
}
