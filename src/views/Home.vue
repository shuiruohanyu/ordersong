<template>
  <el-card v-loading="showLoading" :element-loading-text="loadingText"
  element-loading-spinner="el-icon-loading"
  >
     <el-row type='flex' justify="center">
        <el-col :span="6" style="font-size:30px">老高点歌台</el-col>
       <el-button type='success' @click="btnOrder" :disabled="isOrder">点歌</el-button>
       <el-button type='primary' @click="btnSelect" v-if="showManageBtn">抽取幸运观众</el-button>
       <el-button  @click="btnRemove" v-if="showManageBtn" type='warning'>幸运观众下线</el-button>
       <el-button type='danger' @click="btnReset"  v-if="showManageBtn">重置</el-button>
     </el-row>
     <div class='list'>
      <el-card class='my-card' v-for="(item,index) in list" :key="index" :class="{select: selectIndex === index}">
          <el-row type='flex' justify="center">
            <el-tag>{{ item.name }}</el-tag>
          </el-row>
          <el-row style="height:40px" align="middle" v-if="item.sname" type='flex' justify="center">
           <el-tag type="success">{{ '点了一首:' + item.sname }}</el-tag>
          </el-row>
      </el-card>
     </div>

     <el-drawer
         title="请设置下你的名字"
         :visible.sync="showDrawer"
        >
        <el-row type='flex' justify="center">
          <el-form style='width:80%'>
          <el-form-item>
              <el-input v-model.trim="userName" style="width:80%"></el-input>
             </el-form-item>
             <el-form-item>
               <el-button @click="showDrawer=false">取消</el-button>
               <el-button @click="btnOK" type="primary">确定</el-button>
             </el-form-item>
         </el-form>
        </el-row>

      </el-drawer>
      <el-dialog :visible="showDialog" title='老高点歌台'>
        <el-form>
          <el-form-item>
            <el-input placeholder="请输入歌曲名称"   v-model.trim="songName" style='width:80%'></el-input>
          </el-form-item>
        </el-form>
        <el-row type='flex' justify="end">
           <el-button @click="showDialog=false">取消</el-button>
           <el-button type='primary' @click="btnYes">确定</el-button>
        </el-row>
      </el-dialog>
  </el-card>
</template>

<script>
import { getContent, setContent } from '@/api/user'
export default {
  data () {
    return {
      showDialog: false, // 显示对话框
      showDrawer: false, // 显示抽屉
      userName: '',
      list: [], // 当前list
      timeStamp: null,
      songName: '',
      selectIndex: -1,
      showLoading: false, // 显示进度
      loadingCount: 8, // 选择倒计时时间
      loadingText: '' // 倒计时显示文本
    }
  },
  async created () {
    const userName = localStorage.getItem('myUserName')
    if (!userName) {
      this.showDrawer = true
    } else {
      this.userName = userName
    }
    this.updateData()
    setInterval(() => {
      this.updateData()
    }, 2000)
  },
  methods: {
    // 移除幸运观众
    btnRemove () {
      this.$confirm('确认要下线当前的幸运观众吗').then(() => {
        this.list = this.list.filter((item, index) => index !== this.selectIndex)
        this.selectIndex = -1
        const result = {
          selectIndex: this.selectIndex,
          list: this.list,
          timeStamp: this.timeStamp
        }
        setContent(JSON.stringify(result))
      })
    },
    // 点歌
    btnOrder () {
      if (!this.userName) {
        this.$message('请先填入自己的名字')
        this.showDrawer = true
        return false
      }
      this.showDialog = true
    },
    beginLoading () {
      if (this.loadingCount > 0) {
        this.showLoading = true
        this.loadingCount--
        this.loadingText = `还剩${this.loadingCount}秒钟选人`
        this.beginFlag = setTimeout(this.beginLoading, 1000)
      } else {
        clearTimeout(this.beginFlag)
        this.loadingCount = 6 // 恢复原来的时间
        this.seletOne() // 选择对应的索引
        clearInterval(this.flag)
        this.showLoading = false
      }
    },
    btnYes () {
      if (this.songName) {
        this.list.push({
          name: this.userName,
          sname: this.songName,
          time: this.timeStamp
        })
        const result = {
          selectIndex: this.selectIndex,
          list: this.list,
          timeStamp: this.timeStamp
        }
        setContent(JSON.stringify(result))
        this.showDialog = false
      }
    },
    btnSelect () {
      this.beginLoading()
      var func = () => {
        if (this.selectIndex < (this.list.length - 1)) {
          this.selectIndex++
        } else {
          this.selectIndex = 0
        }
      }
      this.flag = setInterval(func, 100)
    },
    btnReset (obj) {
      this.$confirm('是否要重新设置一次点歌任务?').then(() => {
        this.list = []
        this.selectIndex = -1
        this.timeStamp = Date.now()
        const result = {
          selectIndex: this.selectIndex,
          list: this.list,
          timeStamp: this.timeStamp
        }
        setContent(JSON.stringify(result))
        this.$message({
          type: 'success',
          message: '老高重新设置了一次点歌机会',
          duration: 1000
        })
      })
    },
    // 选择一个
    seletOne () {
      const result = {
        selectIndex: this.selectIndex,
        list: this.list,
        timeStamp: this.timeStamp
      }
      setContent(JSON.stringify(result))
    },
    btnOK () {
      if (!this.userName) {
        this.$message('请设置你的名字')
        return false
      }
      if (this.sameName(this.userName) || this.name === '高高君') {
        this.$message('该名字已经有人设过了')
        return false
      }
      localStorage.setItem('myUserName', this.userName)
      this.showDrawer = false
    },
    sameName (name) {
      return this.list.some(item => item.name === name)
    },
    async updateData () {
      const data = await getContent()
      const result = JSON.parse(data.content) // 当前班里的所有数据
      // { timeStamp:, list: [] , selectIndex: -1 }
      this.timeStamp = result.timeStamp
      this.selectIndex = result.selectIndex
      this.list = result.list
    }
  },
  computed: {
    isOrder: function () {
      return this.list.some(item => item.name === this.userName)
    },
    showManageBtn () {
      return this.userName === '高高君'
    }
  }
}
</script>

<style lang='less' scoped>
/deep/ .el-loading-mask {
  background: none !important;
}
.list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  .my-card {
    width: 180px;
    height: 100px;
    margin: 20px;
    background-image: url('../assets/back.jpg');
    background-size: cover;
  }
  .select {
 background-image: url('../assets/select.jpg');
 }
}
</style>
