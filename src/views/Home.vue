<template>
  <el-card>
     <el-row type='flex' justify="center">
        <el-col :span="6" style="font-size:30px">老高点歌台</el-col>
       <el-button type='success' @click="btnOrder" :disabled="isOrder">点歌</el-button>
       <el-button type='primary' @click="btnSelect" v-if="showManageBtn && !startCount">抽取幸运观众</el-button>
       <el-button type="info" round @click="btnStop" v-if="isGao && startCount">点我喊停</el-button>
       <el-button  @click="btnRemove" v-if="showManageBtn" :disabled="startCount" type='warning'>幸运观众下线</el-button>
       <el-button type='danger' @click="btnReset" :disabled="startCount"  v-if="showManageBtn">重置</el-button>
     </el-row>
     <el-tag size="medium" type='success'>当前用户:{{ userName  }}</el-tag>
     <div class='title'>当前班级人数:{{ this.list.length }}</div>
     <div class='list' ref="myList">
       <div class='my-card' :ref="'student'+index" v-for="(item,index) in list" :key="index">
            <el-tag :closable="isGao && !startCount" @close="removeUser(item)"  :type="index === selectIndex ? 'danger' : ''">{{ item.name }}</el-tag>
      </div>
     </div>
     <el-slider v-if="isGao" label='速度'  :min="1" class='my-Duration' height="200px" vertical v-model="duration"></el-slider>
     <el-card class='select-card' v-if="selectPeople">
          <el-row type='flex' justify="center">
            <div class='userName'>{{ selectPeople.name }}</div>
          </el-row>
          <el-row style="height:40px" align="middle" v-if="selectPeople.sname" type='flex' justify="center">
           <div class="song">{{ '点了一首:' + selectPeople.sname }}</div>
          </el-row>
     </el-card>

     <el-drawer
         title="请设置下你的名字"
         :visible.sync="showDrawer"
        >
        <el-row type='flex' justify="center">
          <el-form style='width:80%'>
          <el-form-item>
              <el-input placeholder="名字长度2-5个字" :minlength="2" :maxlength="5" v-model.trim="userName" style="width:80%"></el-input>
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
      <audio ref="myVoice"  style='display:none' > </audio>
   </el-card>
</template>

<script>
import { getContent, setContent } from '@/api/user'
import { getVoice } from '@/constant/key'
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
      startCount: false, // 开始选择
      flag: 0,
      duration: 1, // 初始毫秒值
      studentFlag: 0 // 记录学生的定时器标记
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
    // 用来手动的触发数据
    async  getVoice (text) {
      this.$refs.myVoice.src = await getVoice(text)
      this.$refs.myVoice.play()
    },
    // 执行滚动到对应的位置
    scrollStudent () {
      if (this.$refs['student' + this.selectIndex] && this.$refs.myList) {
        this.$refs.myList.scrollTop = this.$refs['student' + this.selectIndex][0].offsetTop - 100
      }
    },
    removeUser (obj) {
      this.list = this.list.filter(item => item.name !== obj.name)
      const result = {
        selectIndex: this.selectIndex,
        list: this.list,
        timeStamp: this.timeStamp,
        startCount: false
      }
      setContent(JSON.stringify(result))
    },
    // 点击停止
    btnStop () {
      this.seletOne() // 选择对应的索引
      clearInterval(this.flag)
      this.startCount = false
      this.scrollStudent()
    },
    studentStop () {
      clearInterval(this.studentFlag)
      this.startCount = false
      this.scrollStudent()
    },
    studentStart () {
      this.startCount = true
      var func = () => {
        if (this.selectIndex < (this.list.length - 1)) {
          this.selectIndex = this.selectIndex + 1
        } else {
          this.selectIndex = 0
        }
      }
      this.studentFlag = setInterval(func, 100 / this.duration)
    },
    // 移除幸运观众
    btnRemove () {
      this.$confirm('确认要下线当前的幸运观众吗').then(() => {
        this.list = this.list.filter((item, index) => index !== this.selectIndex)
        this.selectIndex = -1
        const result = {
          selectIndex: this.selectIndex,
          list: this.list,
          timeStamp: this.timeStamp,
          startCount: false
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
          timeStamp: this.timeStamp,
          startCount: this.startCount
        }
        setContent(JSON.stringify(result))
        this.showDialog = false
      }
    },
    btnSelect () {
      this.getVoice('老高开始点名!')
      this.startCount = true // 打开状态
      this.saveStartCountState() // 保存到后端保证后台现在的状态是Ok的
      var func = () => {
        if (this.selectIndex < (this.list.length - 1)) {
          this.selectIndex = this.selectIndex + 1
        } else {
          this.selectIndex = 0
        }
      }
      this.flag = setInterval(func, 100 / this.duration)
    },
    // 保存当前的开始状态数据 用来识别
    saveStartCountState () {
      const result = {
        selectIndex: this.selectIndex,
        list: this.list,
        timeStamp: this.timeStamp,
        startCount: this.startCount // 是否开启点名程序
      }
      setContent(JSON.stringify(result))
    },
    btnReset (obj) {
      this.$confirm('是否要重新设置一次点歌任务?').then(() => {
        this.list = []
        this.selectIndex = -1
        this.timeStamp = Date.now()
        const result = {
          selectIndex: this.selectIndex,
          list: this.list,
          timeStamp: this.timeStamp,
          startCount: false // 是否开启点名程序
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
        timeStamp: this.timeStamp,
        startCount: false // 关闭状态
      }
      this.getVoice('老高好坏,抽中了' + this.selectPeople.name)

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
      this.list.push({ name: this.userName })
      this.saveStartCountState()
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
      // 这里要处理两种场景 老高 /学生端
      // 如果是老高 所有的状态只由自己控制
      // 如果是学生 所有的状态由老高控制
      if (this.isGao) {
        // 老高
        this.startCount = result.startCount
      } else {
        // 学生端
        if (!this.startCount && result.startCount) {
          // 原来没开启 现在开启了 开始学生状态
          this.studentStart() // 学生端开启
        } else if (this.startCount && !result.startCount) {
          this.getVoice(`为${result.list[result.selectIndex].name}同学鼓掌吧,他的运气真是无敌了`)

          // 原来没开启 现在开启了
          this.studentStop()
        } else {
          // 如果学生端状态一致 此时动作已经开启 因为 默认值是false 一方任何不同都会进到上面的逻辑 这里不需要做任何操作
        }
      }
      if (!this.startCount) {
        // 只在不点名的时候赋值
        this.selectIndex = result.selectIndex
      }
      this.list = result.list
    }
  },
  computed: {
    isOrder: function () {
      return this.list.some(item => item.name === this.userName)
    },
    showManageBtn () {
      return this.userName === '高高君' && this.list.length
    },
    // 是否是老高
    isGao () {
      return this.userName === '高高君'
    },
    // 当前选中的
    selectPeople () {
      return this.selectIndex > -1 ? this.list[this.selectIndex] : this.list[0]
    }
  }
}
</script>

<style lang='less' scoped>
/deep/ .el-loading-mask {
  background: none !important;
}
.list {
   height: 550px;
   overflow-x: hidden;
   overflow-y: auto;
   width: 160px;
   border:1px solid #ccc;
  .my-card {
    width: 130px;
    margin: 5px 20px;
  }

}
.my-Duration {
  position: absolute !important;
  top: 50%;
  margin-top: -100px;
  left:250px;
}
  .select-card {
    position: absolute ;
    top: 50%;
    left:50%;
    margin-left: -200px;
    margin-top: -200px;
    // margin: 20px auto;
    width: 400px;
    height: 400px;
    background-image: url('../assets/select.jpg');
    background-size: cover;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
.song {
     margin-top:40px;
     text-align: center;
     font-size: 20px;
     color: red
  }

    .userName {
      text-align: center;
      border-radius: 50%;
      overflow: hidden;
       height: 150px;
       width:150px;
       color: #fff;
       font-size: 40px;
       line-height: 150px;
       font-weight: bold;
       background-color: rgba(10, 86, 226, 0.575)
    }
  }
</style>
