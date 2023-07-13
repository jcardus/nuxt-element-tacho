<i18n lang="yaml">
es:
  'Done': 'Hecho'
  'Processing': 'Procesando'
  'Pending': 'Pendiente'
</i18n>
<template>
  <div style="padding: 10px">
    <el-dialog :close-on-click-modal="false" :visible.sync="requestTachoDownloadDialog" :title="$t('Solicitar Descarga')" top="5vh">
      <el-form style="overflow: scroll; padding: 0">
        <div style="padding-bottom: 20px">
          <span>{{ $t('Vehículo')+ ': ' + (selectedVehicle ? selectedVehicle.name : '') }}</span>
        </div>
        <div style="padding-bottom: 30px">
          <el-date-picker
            v-model="tachoDownloadsDateRange"
            type="daterange"
            :range-separator="$t('A')"
            :start-placeholder="$t('Fecha de Inicio')"
            :end-placeholder="$t('Fecha Final')"
          />
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="info"
          size="small"
          @click="handleCancel"
        >
          {{ $t('Cancelar') }}
        </el-button>
        <el-button
          :loading="loading"
          :disabled="!tachoDownloadsDateRange || !tachoDownloadsDateRange[0] || !tachoDownloadsDateRange[1]"
          type="success"
          size="small"
          @click="handleSubmit"
        >
          {{ $t('Enviar') }}
        </el-button>
      </span>
    </el-dialog>
    <div>
      <tacho-vehicle-details v-if="vehicleDetailsOpen" :entity-type="'V'" :selected-entity="selectedVehicle" @closeVehicleDetails="closeVehicleDetails" />
    </div>
    <div v-if="!vehicleDetailsOpen">
      <el-table
        :data="tachoDevices"
        :header-cell-class-name="headerClassName"
        :cell-class-name="cellClassName"
        @row-dblclick="handleDoubleClick"
      >
        <el-table-column prop="name" :label="$t('Vehículo')" sortable />
        <el-table-column width="15px" />
        <el-table-column :label="$t('Descarga')" header-align="center">
          <el-table-column prop="lastTachoDownload.requestdate" :label="$t('Última Petición')" sortable :formatter="dateRenderer" />
          <el-table-column prop="lastTachoDownload.status" :label="$t('Estado')" :formatter="statusRenderer" sortable />
        </el-table-column>
        <el-table-column width="15px" />
        <el-table-column :label="$t('Conexión al Tacografo')" header-align="center" prop="tachoConnection">
          <el-table-column prop="tachoConnection.lastupdate" :label="$t('Última Petición')" sortable :formatter="dateRenderer" />
          <el-table-column prop="tachoConnection.status" :label="$t('Estado')" :formatter="statusRenderer" sortable />
          <el-table-column :label="$t('Resultado')" sortable>
            <template slot-scope="item">
              {{ getTachoConnectionResult(item.row) }}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column width="15px" />
        <el-table-column width="200" align="right" label="" fixed="right">
          <template slot-scope="scope">
            <el-tooltip :content="$t('Ver')" placement="top">
              <el-button
                size="mini"
                @click="handleDoubleClick(scope.row)"
              >
                <font-awesome-icon :icon="['fas', 'binoculars']" />
              </el-button>
            </el-tooltip>
            <el-tooltip :content="$t('Comprobar la conexión al tacógrafo')" placement="top">
              <el-button
                size="mini"
                type="info"
                @click="handleCheckTachoConnection(scope.row)"
              >
                <font-awesome-icon :icon="['fas', 'link']" />
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { convertToISODate } from '@/utils/utils'
import { convertStatus, getTachoStatus } from '@/utils/tacho'
import tachoVehicleDetails from '@/components/tacho/tachoVehicleDetails'

export default {
  name: 'TachoVehicles',
  components: { tachoVehicleDetails },
  data () {
    return {
      selectedVehicle: null,
      vehicleDetailsOpen: false,
      tachoDownloadsDateRange: '',
      requestTachoDownloadDialog: false
    }
  },
  computed: {
    ...mapGetters(['user', 'devices', 'loading']),
    tachoDevices () {
      return this.devices.filter(d => d.attributes.xpert).sort((a, b) => a.name.localeCompare(b.name))
    }
  },
  methods: {
    headerClassName ({ rowIndex, columnIndex }) {
      if ((rowIndex === 0 && columnIndex === 1) ||
        (rowIndex === 0 && columnIndex === 3) ||
        (rowIndex === 0 && columnIndex === 5)) {
        return 'emptyColumn'
      }
      if ((rowIndex === 0 && columnIndex === 2) ||
        (rowIndex === 1 && columnIndex === 0) ||
        (rowIndex === 1 && columnIndex === 1)) {
        return 'downloadHeader'
      }
      if ((rowIndex === 0 && columnIndex === 4) ||
        (rowIndex === 1 && columnIndex === 2) ||
        (rowIndex === 1 && columnIndex === 3) ||
        (rowIndex === 1 && columnIndex === 4)) {
        return 'connectionHeader'
      }
      return ''
    },
    cellClassName ({ columnIndex }) {
      if (columnIndex === 1 ||
        columnIndex === 4 ||
        columnIndex === 8) {
        return 'emptyColumn'
      }
      return ''
    },
    statusRenderer (row, column, status) {
      return status !== undefined ? this.$t(convertStatus(status)) : ''
    },
    dateRenderer (row, column, date) {
      return date !== undefined ? new Date(date).toLocaleString() : ''
    },
    getTachoConnectionResult (item) {
      return item.tachoConnection && item.tachoConnection.status === 2 ? (item.tachoConnection.valid.data[0] ? 'OK' : 'Con Error' + ' - ' + item.tachoConnection.result) : ''
    },
    handleDoubleClick (row) {
      this.selectedVehicle = row
      this.vehicleDetailsOpen = true
    },
    closeVehicleDetails () {
      this.vehicleDetailsOpen = false
    },
    handleRequestDownload (row) {
      this.selectedVehicle = row
      this.requestTachoDownloadDialog = true
    },
    handleCheckTachoConnection (row) {
      try {
        this.$confirm(this.$t('Quiere enviar una solicitud para comprobar el estado de la conexión del tacógrafo'), this.$t('Conexión del Tacógrafo'), {
          confirmButtonText: this.$t('Sí'),
          cancelButtonText: this.$t('No')
        }).then(async () => {
          await this.$tacho.requestTachoConnection(row.id)
          this.$message({
            message: this.$t('Pedido enviado con éxito'),
            type: 'success',
            duration: 5 * 1000
          })
          await getTachoStatus(this.$store, this.$tacho)
        }).catch(() => {
        })
      } catch (e) {
        this.$message({
          message: e,
          type: 'warning',
          duration: 5 * 1000
        })
      }
    },
    handleCancel () {
      this.requestTachoDownloadDialog = false
    },
    async handleSubmit () {
      try {
        await this.$tacho.requestTachoDownload(this.user.attributes.companyId, this.selectedVehicle.id, convertToISODate(new Date(this.tachoDownloadsDateRange[0])), convertToISODate(new Date(this.tachoDownloadsDateRange[1])), 'V')
        this.$message({
          message: this.$t('Pedido enviado con éxito'),
          type: 'success',
          duration: 5 * 1000
        })
      } catch (e) {
        this.$message({
          message: e,
          type: 'warning',
          duration: 5 * 1000
        })
      }
      this.requestTachoDownloadDialog = false
    }
  }
}
</script>
<!--suppress CssUnusedSymbol -->
<style>
.downloadHeader {
  background: #E5E7EA !important;
}
.connectionHeader {
  background: #DADCE0 !important;
}
.emptyColumn {
  background: #FFFFFF !important;
}
</style>
