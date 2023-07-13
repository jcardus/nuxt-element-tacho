<i18n lang="yaml">
es:
  'Done': 'Hecho'
  'Processing': 'Procesando'
  'Pending': 'Pendiente'
</i18n>
<template>
  <div style="padding: 10px">
    <div>
      <tacho-vehicle-details v-if="driverDetailsOpen" :entity-type="'D'" :selected-entity="selectedDriver" @closeVehicleDetails="closeDriverDetails" />
    </div>
    <el-table v-if="!driverDetailsOpen" :data="filteredDrivers">
      <el-table-column prop="name" :label="$t('Conductor')" sortable />
      <el-table-column prop="lastTachoDownload.requestdate" :label="$t('Última Petición')" sortable :formatter="dateRenderer" />
      <el-table-column prop="lastTachoDownload.status" :label="$t('Estado')" sortable :formatter="statusRenderer" />
      <el-table-column width="175" align="right" label="" fixed="right">
        <template slot-scope="scope">
          <el-tooltip :content="$t('Ver')" placement="top">
            <el-button
              size="mini"
              @click="handleDoubleClick(scope.row)"
            >
              <font-awesome-icon :icon="['fas', 'binoculars']" />
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('Solicitar Descarga')" placement="top">
            <el-button
              size="mini"
              type="info"
              @click="handleRequestDownload(scope.row)"
            >
              <font-awesome-icon :icon="['fas', 'download']" />
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { convertStatus } from '../../utils/tacho'
import tachoVehicleDetails from './tachoVehicleDetails'

export default {
  name: 'TachoDrivers',
  components: { tachoVehicleDetails },
  data () {
    return {
      selectedDriver: null,
      driverDetailsOpen: false,
      requestTachoDownloadDialog: false
    }
  },
  computed: {
    ...mapGetters(['drivers', 'user']),
    filteredDrivers () {
      return this.drivers.filter(d => d.uniqueId && d.uniqueId.length === 16 && d.uniqueId.startsWith('E')).sort((a, b) => a.name.localeCompare(b.name))
    }
  },
  methods: {
    statusRenderer (row, column, status) {
      return status !== undefined ? this.$t(convertStatus(status)) : ''
    },
    dateRenderer (row, column, date) {
      return date !== undefined ? new Date(date).toLocaleString() : ''
    },
    handleDoubleClick (row) {
      this.selectedDriver = row
      this.driverDetailsOpen = true
    },
    closeDriverDetails () {
      this.driverDetailsOpen = false
    },
    handleRequestDownload (row) {
      this.$confirm(this.$t('¿Quieres enviar un pedido de descarga al conductor ') + row.name + '?', this.$t('Última Petición'), {
        confirmButtonText: this.$t('Confirmar'),
        cancelButtonText: this.$t('Cancelar')
      }).then(async () => {
        this.selectedDriver = row
        await this.handleSubmit()
      })
    },
    async handleSubmit () {
      try {
        await this.$tacho.requestTachoDownload(this.user.attributes.companyId, this.selectedDriver.id, new Date().toISOString().slice(0, 10), new Date().toISOString().slice(0, 10), 'D')
        this.$message({
          message: this.$t('Pedido enviado con éxito'),
          type: 'success',
          duration: 5 * 1000
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        this.$message({
          message: this.$t('Hubo un error al enviar el pedido'),
          type: 'warning',
          duration: 5 * 1000
        })
      }
      this.requestTachoDownloadDialog = false
    }
  }
}
</script>

<style scoped>

</style>
