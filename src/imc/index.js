const cryptor = require('./cryptor');
const axios = require('axios');

module.exports = function(){
	function getHeaders(XAuth){
		return {
			headers:{
				"Accept":"application/json",
				"Content-Type":"application/json",
				"X-Authorization":XAuth
			}
		}
	}
	async function post(url,data,head){
		return (await axios.post(process.env.url+"/"+process.env.agencycode+url,data,head)).data;
	}
	// 사용자인증
	async function authorize(id, pw){
		if(id == undefined || pw == undefined){
			console.log("imc authorize: id or pw equal undefined");
			return;
		}
		let token = cryptor.getToken(id,pw);
		let XAuth = cryptor.getXAuth({token:token});


		let head = getHeaders(XAuth);
		let data = {
			ssotoken:token
		}

		return await post("/auth/authorize",data,head);
	}

	async function roombasic(data){
		if(data == undefined){
			console.log("imc roombasic: data undefined");
			return;
		}
		let XAuth = cryptor.getXAuth(data);
		let head = getHeaders(XAuth);
		return await post("/rec/roombasic/get",data,head);
	}
	return {
		authorize,
		roombasic
	}
}();
