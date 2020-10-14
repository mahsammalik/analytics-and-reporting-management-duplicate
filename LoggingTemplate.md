# Logging Template

## Use

>

    class example {
     test(arg1,arg2){
    	 try{
    	 logger.info({event:'Entered function',functionName:'test in class example',arg1,arg2});

    	 /**
    	 **
    	 ** block of code
    	 **
    	 **
    	 **/


    //for debugging
    logger.debug({event:'debugging',})

    	 if(condition1){
    		logger.info({event:'Entered block condition1',});
    		logger.info({event:'Exited block condition2',});
    	 }else if{
    		logger.info({event:'Entered block condition1',});
    		logger.info({event:'Exited block condition2',});
    	 }

    	 logger.info({event:'Exited function',functionNane:'test in class example'});

    	 return something;
    	 }catch(error){
    		 logger.error({event:'Error thrown',functionNane:'test in class example',error:{message:error.message,stack:error.stack})
    		 }
     }
     }

## Winston Logger format

>

    {ms_event:'Entered function',ms_functionName:'test',ms_arg1:arg1,ms_arg2:arg2,ms_error:error},
    ms_level:'info',
    ms_timestamp:'05-10-20 10:00:00'
    }
