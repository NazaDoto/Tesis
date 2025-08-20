<template>
  <footer class="footer">
    <div class="ancho-pag container-footer">
      <div class="footer-header">
        <img class="img-footer" src="../../public/recursos/logo-gobierno.png" alt="">
      </div>
      <div class="footer-content">
        <a class="link-pie" href="http://mdssde.gob.ar" target="__blank">PÁGINA MINISTERIO</a>
        <a href="https://www.facebook.com/profile.php?id=61552046130284" class="link-pie">FACEBOOK</a>
      </div>
      <div class="footer-content">
          <router-link class="link-pie" to="/contacto">CONTACTO</router-link>        
          <a href="https://maps.app.goo.gl/XADPbVnJhzR3pyNd7" class="link-pie" target="__blank">DIRECCIÓN: SÁENZ PEÑA N° 340</a>    
      </div>
    </div>
    <!-- Copyright -->
  </footer>
</template>

<script>
export default {

}
</script>

<style scoped>
.block{
  display: block;
}
.link-pie{
  display: block;
  width: 100%;
  margin: auto;
  color:white;
  text-decoration: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.container-footer {
  height: 25svh;
  background-color: rgb(62, 62, 171);
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.footer-header {
  display: flex;
  color: white;
  height: 50%;
}

.footer-content {
  flex-direction: column;
  color: white;
  border-left: solid white 1px;
  height: 50%;
  padding-left: 10px;
  width: 30%;
    overflow-x: hidden;

}

.img-footer {
  height: 100%;
}

.footer {
  width: 100%;
}

@media screen and (max-width: 1150px){
    .ancho-pag{
      padding: 0 5px;
    }
    .img-footer{
      height: 50px;
    }
    .container-footer{
      gap:5px;
    }
}
</style>