<i18n lang="yaml">
es:
  'Done': 'Hecho'
  'Processing': 'Procesando'
  'Pending': 'Pendiente'
</i18n>
<template>
  <div>
    <div style="padding: 10px">
      <el-date-picker
        v-model="tachoDownloadsDateRange"
        type="daterange"
        :range-separator="$t('A')"
        :start-placeholder="$t('Fecha de Inicio')"
        :end-placeholder="$t('Fecha Final')"
        @change="onDatesChange()"
      />
    </div>
    <div style="padding: 10px">
      <!--suppress HtmlUnknownAttribute -->
      <el-table v-loading="loading" :data="tachoDownloads">
        <el-table-column prop="entityid" :label="$t('Vehículo')" :formatter="getName" />
        <el-table-column prop="requestdate" :label="$t('Fecha de Solicitud')" :formatter="(row, column, value) => new Date(value).toLocaleString()" sortable />
        <el-table-column prop="startdate" :label="$t('Fecha de Inicio')" :formatter="(row, column, value) => new Date(value).toLocaleDateString()" sortable />
        <el-table-column prop="enddate" :label="$t('Fecha Final')" :formatter="(row, column, value) => new Date(value).toLocaleDateString()" sortable />
        <el-table-column prop="status" :label="$t('Estado')" :formatter="statusRenderer" sortable />
        <el-table-column prop="type" :label="$t('Tipo')" sortable>
          <template slot-scope="item">
            {{ item.row.type === 'V' ? 'Vehículo' : 'Conductor' }}
          </template>
        </el-table-column>
        <el-table-column prop="" :label="$t('Tipo de Solicitud')">
          <template slot-scope="item">
            {{ item.row.automatic.data[0] ? $t('Automatico') : $t('Manual') }}
          </template>
        </el-table-column>
        <el-table-column prop="conclusiondate" :label="$t('Fecha de Conclusión')" :formatter="(row, column, value) => value ? new Date(value).toLocaleString() : ''" sortable />
        <el-table-column :label="$t('Archivo')">
          <template slot-scope="item">
            <el-tooltip :content="$t('Bajar')">
              <a v-if="item.row.s3id" :href="item.row.s3id"><i class="el-icon-download" style="padding: 10px" /></a>
            </el-tooltip>
            <el-tooltip :content="$t('Vizualizar')">
              <a v-if="item.row.s3id && item.row.type !== 'V'" target="_blank" :href="'/reports/tacho/dataviewer/?s3='+item.row.s3id">
                <i class="el-icon-view" style="padding: 10px; font-size: larger" />
              </a>
            </el-tooltip>
            <el-tooltip :content="$t('Datos técnicos')">
              <a v-if="item.row.s3id" target="_blank" :href="'/reports/tacho/preview/?s3='+item.row.s3id">
                <i class="el-icon-tickets" style="padding: 10px" />
              </a>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { convertStatus, getEntityName } from '@/utils/tacho'

export default {
  name: 'TachoDownloads',
  data () {
    return {
      tachoDownloadsDateRange: [new Date().setMonth(new Date().getMonth() - 1), new Date()],
      tachoDownloads: []
    }
  },
  computed: {
    ...mapGetters(['devices', 'drivers', 'loading'])
  },
  mounted () {
    this.onDatesChange()
  },
  methods: {
    getName (row, column, value) {
      return getEntityName(value, row.type, this.devices, this.drivers)
    },
    statusRenderer (row, column, status) {
      return status !== undefined ? this.$t(convertStatus(status)) : ''
    },
    async onDatesChange () {
      this.$store.commit('setLoading', true)
      const startDate = new Date(this.tachoDownloadsDateRange[0])
      const endDate = new Date(this.tachoDownloadsDateRange[1])

      startDate.setHours(0, 0, 0)
      endDate.setHours(23, 59, 59)

      const data = await this.$tacho.getByDate(startDate.toISOString(), endDate.toISOString())
      this.tachoDownloads = data.sort((a, b) => new Date(b.requestdate) - new Date(a.requestdate))
      this.$store.commit('setLoading', false)
    }
  }
}
</script>

<style scoped>

</style>
