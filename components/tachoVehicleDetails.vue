<i18n lang="yaml">
es:
  'Done': 'Hecho'
  'Processing': 'Procesando'
  'Pending': 'Pendiente'
</i18n>
<template>
  <div style="padding: 10px">
    <el-card class="box-card">
      <div slot="header" class="clearfix" style="height: 35px">
        <span><font-awesome-icon style="padding-right: 5px;" :icon="entityType === 'V' ? ['fas', 'car'] : ['fas', 'address-card']" />{{ selectedEntity ? selectedEntity.name : '' }}</span>
        <el-button
          v-if="selectedEntity"
          size="small"
          type="info"
          style="float: right; margin-right: 10px; font-size: 14px"
          @click="closeVehicleDetails"
        >
          <font-awesome-icon :icon="['fas', 'times']" /><span style="padding-left: 5px">{{ $t('Cerrar') }}</span>
        </el-button>
      </div>
      <!--suppress HtmlUnknownAttribute -->
      <el-table v-loading="loading" :data="vehicleTachoDownloads">
        <el-table-column :label="$t('Fecha de Solicitud')">
          <template slot-scope="item">
            {{ new Date(item.row.requestdate).toLocaleString() }}
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
        <el-table-column :label="$t('Tipo de Solicitud')">
          <template slot-scope="item">
            {{ item.row.automatic.data[0] ? $t('Automatico') : $t('Manual') }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('Fecha de Conclusión')">
          <template slot-scope="item">
            {{ item.row.conclusiondate ? new Date(item.row.conclusiondate).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('Archivo')">
          <template slot-scope="item">
            <a v-if="item.row.s3id" :href="item.row.s3id">{{ $t('Archivo') }}</a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>

import { convertStatus } from '@/utils/tacho'

export default {
  name: 'TachoVehicleDetails',
  props: {
    selectedEntity: {
      type: Object,
      default: null
    },
    entityType: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      loading: false,
      vehicleTachoDownloads: []
    }
  },
  async mounted () {
    this.loading = true
    this.vehicleTachoDownloads = await this.$tacho.getByDevice(this.selectedEntity.id)
    this.loading = false
  },
  methods: {
    getStatus (status) {
      return this.$t(convertStatus(status))
    },
    closeVehicleDetails () {
      this.$emit('closeVehicleDetails', null)
    }
  }
}
</script>

<style scoped>

</style>
