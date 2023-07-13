<i18n lang="yaml">
es:
  'Descarregue a aplicação TachoClient': 'Descarga la aplicación del tacógrafo'
  'Done': 'Hecho'
  'Processing': 'Procesando'
  'Pending': 'Pendiente'
</i18n>
<template>
  <div>
    <el-menu :default-active="currentPage" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="0">
        {{ $t('Tacógrafo') }}
      </el-menu-item>
      <el-menu-item index="1">
        {{ $t('Vehículos') }}
      </el-menu-item>
      <el-menu-item index="2">
        {{ $t('Conductores') }}
      </el-menu-item>
      <el-menu-item index="3">
        {{ $t('Descargas') }}
      </el-menu-item>
    </el-menu>
    <div v-if="currentPage === '0'">
      <el-card class="box-card">
        <span>
          <font-awesome-icon style="padding-right: 5px;" :icon="['fas', 'cloud-download-alt']" />
          {{ $t('Descarregue a aplicação TachoClient') }}
          <a href="https://fleetmap-io.github.io/tachograph/publish.htm" target="_blank">{{ $t('aqui') }}</a>.
        </span>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span><font-awesome-icon style="padding-right: 5px;" :icon="['fas', 'cogs']" />{{ $t('Estado del sistema') }}</span>
          <div style="float: right">
            <span :style="'color: ' + (connected ? '#008000' : '#ff0000')"><font-awesome-icon style="padding-right: 5px;" :icon="['fas', 'credit-card']" />
              {{ connected ? $t('Tarjeta conectada..') : $t('Tarjeta desconectada.') }}
            </span>
            <span>{{ new Date(tachoLastUpdate).toLocaleString() }}</span>
          </div>
          <div style="float: right; padding-right: 30px">
            <span :style="'color: ' + (connected ? '#008000' : '#ff0000')"><font-awesome-icon style="padding-right: 5px;" :icon="['fas', 'desktop']" />
              {{ connected ? $t('Cliente conectado.') : $t('Cliente desconectado.') }}
            </span>
          </div>
        </div>
        <el-card class="info-card">
          <span>
            <font-awesome-icon style="padding-right: 5px;" :icon="['fas', 'download']" />
            {{ isDownloadProcessing ? $t('Hay descargas en curso en este momento') : $t('No hay descargas en curso actualmente') }}
          </span>
        </el-card>
        <el-table v-if="isDownloadProcessing" :data="processingDownloads" class="download-Processing-Table">
          <el-table-column prop="entityid" :label="$t('Vehículo')">
            <template slot-scope="item">
              {{ getDeviceName(item.row) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('Fecha de Inicio')">
            <template slot-scope="item">
              {{ new Date(item.row.startdate).toLocaleDateString() }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('Fecha Final')">
            <template slot-scope="item">
              {{ new Date(item.row.enddate).toLocaleDateString() }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('Estado')">
            <template slot-scope="item">
              {{ $t(getStatus(item.row.status)) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('Tipo')">
            <template slot-scope="item">
              {{ item.row.type === 'V' ? $t('Vehículo') : $t('Conductor') }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('Tipo de Pedido')">
            <template slot-scope="item">
              {{ item.row.automatic ? $t('Automatico') : $t('Manual') }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-row>
        <el-col :span="12">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span><font-awesome-icon style="padding-right: 5px;" :icon="['fas', 'car']" />{{ $t('Descargas pendientes de vehiculos') }}</span>
            </div>
            <el-table :data="pendingVehicleRemoteDownloads">
              <el-table-column prop="entityid" :label="$t('Vehículo')">
                <template slot-scope="item">
                  {{ getDeviceName(item.row) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('Fecha de Solicitud')">
                <template slot-scope="item">
                  {{ getDate(item.row.requestdate) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span><font-awesome-icon style="padding-right: 5px;" :icon="['fas', 'address-card']" />{{ $t('Descargas pendientes de conductores') }}</span>
            </div>
            <el-table :data="pendingDriverRemoteDownloads">
              <el-table-column prop="entityid" :label="$t('Conductores')">
                <template slot-scope="item">
                  {{ getDriverName(item.row) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('Fecha de Solicitud')">
                <template slot-scope="item">
                  {{ getDate(item.row.requestdate) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('Tipo de Solicitud')">
                <template slot-scope="item">
                  {{ item.row.automatic.data[0] ? $t('Automatico') : $t('Manual') }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <tacho-vehicles v-if="currentPage === '1'" />
    <tacho-drivers v-if="currentPage === '2'" />
    <tacho-downloads v-if="currentPage === '3'" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { convertStatus, getTachoStatus } from '@/utils/tacho'
import { getLogoUrl } from '@/utils'
import tachoDownloads from '@/components/tachoDownloads'
import tachoVehicles from '@/components/tachoVehicles'
import tachoDrivers from '@/components/tachoDrivers'

export default {
  name: 'TachoPage',
  components: { tachoVehicles, tachoDrivers, tachoDownloads },
  data () {
    return {
      currentPage: '0'
    }
  },
  computed: {
    ...mapGetters(['cognitoSession', 'email', 'devices', 'drivers', 'tachoDownloads', 'tachoLastUpdate']),
    logoUrl () {
      return getLogoUrl()
    },
    processingDownloads () {
      return this.tachoDownloads.filter(d => d.status === 1)
    },
    pendingVehicleRemoteDownloads () {
      const lastTachoDownloads = this.devices.filter(d => d.lastTachoDownload).map(d => d.lastTachoDownload.id)
      return this.tachoDownloads.filter(d => d.status === 0 && d.type === 'V' && lastTachoDownloads.includes(d.id))
    },
    pendingDriverRemoteDownloads () {
      return this.tachoDownloads.filter(d => d.status === 0 && d.type === 'D')
    },
    isDownloadProcessing () {
      return this.processingDownloads.length > 0
    },
    connected () {
      return new Date().getTime() - new Date(this.tachoLastUpdate).getTime() < 300000
    }
  },
  created () {
    setInterval(this.getTachoStatus, 15000)
  },
  mounted () {
    this.$store.commit('setTitle', this.$t('Tacógrafo'))
  },
  methods: {
    handleSelect (key) {
      this.currentPage = key
    },
    getDeviceName (item) {
      const device = this.devices.find(d => d.id === item.entityid)
      return device ? device.name : item.entityid
    },
    getDriverName (item) {
      const driver = this.drivers.find(d => d.id === item.entityid)
      return driver ? driver.name : item.entityid
    },
    getDate (date) {
      return new Date(date).toLocaleString()
    },
    async getTachoStatus () {
      try {
        await getTachoStatus(this.$store, this.$tacho)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    },
    getStatus (status) {
      return this.$t(convertStatus(status))
    }
  }
}
</script>

<style scoped>
  .box-card {
    margin: 20px 40px 20px 40px;
  }

  .info-card {
    margin: 10px 50px 10px 50px;
    height: 50px;
    position: relative;
    display:flex;
    justify-content: left;
    align-items: center;
    vertical-align: center;
  }

  .download-Processing-Table {
    margin: 10px 50px 10px 50px;
    width: 90%;
  }
</style>
